import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setEmails } from '../reducers/authentication';

interface EmailAttachment {
    filename: string;
    attachmentId: string;
    data: string;
    contentType?: string;
    contentBytes?: string;
    name?: string;
}

export interface GmailMessage {
    id: string;
    snippet: string;
    subject: string;
    body: string;
    from: string;
    attachments: EmailAttachment[];
}

export const useFetchGoogleEmails = (googleToken: string | null, currentPage: number, rowsPerPage: number, filters: { subject: string; sender: string; hasAttachment: boolean }) => {
    const dispatch = useDispatch();
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchAttachment = useCallback(async (googleToken: string, messageId: string, attachmentId: string) => {
        try {
            const response = await fetch(
                `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
                {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${googleToken}` },
                }
            );
            if (!response.ok) throw new Error(`Failed to fetch attachment: ${response.status}`);
            const attachmentData = await response.json();

            let base64Data = attachmentData.data.replace(/-/g, '+').replace(/_/g, '/');
            while (base64Data.length % 4 !== 0) {
                base64Data += '=';
            }

            return base64Data;
        } catch (error) {
            console.error('Error fetching attachment:', error);
        }
    }, []);

    const fetchGoogleEmails = useCallback(async () => {
        if (!googleToken) return;
        setLoading(true);
        try {
            let query = '';
            if (filters.subject) query += `subject:${filters.subject} `;
            if (filters.sender) query += `from:${filters.sender} `;
            if (filters.hasAttachment) query += 'has:attachment ';

            const url = `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${rowsPerPage}&q=${encodeURIComponent(query)}${currentPage ? `&pageToken=${nextPageToken}` : ''}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { Authorization: `Bearer ${googleToken}` },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            const messageIds: { id: string }[] = data.messages || [];
            setNextPageToken(data.nextPageToken || null);

            const messages: GmailMessage[] = await Promise.all(
                messageIds.map(async (message) => {
                    const messageResponse = await fetch(
                        `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`,
                        {
                            method: 'GET',
                            headers: { Authorization: `Bearer ${googleToken}` },
                        }
                    );
                    if (!messageResponse.ok) throw new Error(`HTTP error! status: ${messageResponse.status}`);
                    const messageData = await messageResponse.json();

                    const subjectHeader = messageData.payload.headers.find(
                        (header: { name: string; value: string }) => header.name === 'Subject'
                    );
                    const subject = subjectHeader ? subjectHeader.value : 'No Subject';

                    const fromHeader = messageData.payload.headers.find(
                        (header: { name: string; value: string }) => header.name === 'From'
                    );
                    const from = fromHeader ? fromHeader.value : 'Unknown Sender';

                    let body = '';
                    const attachments: EmailAttachment[] = [];
                    const parts = messageData.payload.parts || [];
                    for (const part of parts) {
                        if (part.mimeType === 'text/plain' && part.body.data) {
                            body = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                        } else if (part.mimeType === 'text/html' && part.body.data) {
                            body = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                        } else if (part.filename && part.body.attachmentId) {
                            const attachmentId = part.body.attachmentId;
                            const attachment = await fetchAttachment(googleToken, message.id, attachmentId);
                            attachments.push({
                                filename: part.filename,
                                attachmentId,
                                data: attachment || '',
                            });
                        }
                    }

                    return {
                        id: messageData.id,
                        snippet: messageData.snippet,
                        subject,
                        from,
                        body,
                        attachments,
                    } as GmailMessage;
                })
            );

            dispatch(setEmails(messages));
        } catch (error) {
            console.error('Error fetching emails:', error);
        }
        finally {
            setLoading(false); // Set loading to false after the API call is complete
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [googleToken, filters, rowsPerPage, currentPage, dispatch, fetchAttachment]);

    useEffect(() => {
        if (googleToken) {
            fetchGoogleEmails();
        }
    }, [googleToken, fetchGoogleEmails]);
    return { loading };
};
