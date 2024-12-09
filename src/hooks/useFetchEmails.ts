import { useState, useCallback } from 'react';
export interface GmailMessage {
    from: string;
    id: string;
    snippet: string;
    subject: string;
    body: string;
    attachments: EmailAttachment[];
}
export interface EmailAttachment {
    filename: string;
    attachmentId: string;
    data: string;
    mimeType?: string
}

const useFetchEmails = (rowsPerPage: number) => {
    const [emails, setEmails] = useState<GmailMessage[]>([]);
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);

    const fetchEmails = useCallback(async (
        accessToken: string,
        pageToken: string | null,
        subjectFilter = '',
        fromFilter = '',
        hasAttachment = false
    ) => {
        try {
            let query = '';
            if (subjectFilter) query += `subject:${subjectFilter} `;
            if (fromFilter) query += `from:${fromFilter} `;
            if (hasAttachment) query += 'has:attachment';

            const url = `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${rowsPerPage}&q=${encodeURIComponent(query)}${pageToken ? `&pageToken=${pageToken}` : ''}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { Authorization: `Bearer ${accessToken}` },
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
                            headers: { Authorization: `Bearer ${accessToken}` },
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
                            const attachment = await fetchAttachment(accessToken, message.id, attachmentId);
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

            setEmails(messages);
        } catch (error) {
            console.error('Error fetching emails:', error);
        }
    }, [rowsPerPage]);

    const fetchAttachment = async (accessToken: string, messageId: string, attachmentId: string) => {
        try {
            const response = await fetch(
                `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
                {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${accessToken}` },
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
    };

    return { emails, nextPageToken, fetchEmails };
};

export default useFetchEmails;
