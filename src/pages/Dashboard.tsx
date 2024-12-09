import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../config/store';
import Header from '../component/Header';
import { Alert, Box, Button, Checkbox, CircularProgress, Container, FormControlLabel, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, TextField } from '@mui/material';
import { useFetchGoogleUserInfo } from '../hooks/useFetchGoogleUserInfo';
import { useFetchMicrosoftUserInfo } from '../hooks/useFetchMicrosoftUserInfo';
import { useFetchGoogleEmails } from '../hooks/useFetchGoogleEmails';
import DOMPurify from 'dompurify';
import { setEmails } from '../reducers/authentication';

const Dashboard = () => {
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [filters, setFilters] = useState({ subject: '', sender: '', hasAttachment: false });
    const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [nextPageUrl, setNextPageUrl] = useState('https://graph.microsoft.com/v1.0/me/messages');

    const { googleToken, microsoftToken, emails } = useSelector((state: RootState) => state.auth);
    useFetchGoogleUserInfo(googleToken);
    useFetchMicrosoftUserInfo(microsoftToken);


    const dispatch = useDispatch();

    const { loading } = useFetchGoogleEmails(googleToken, currentPage, rowsPerPage, filters);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setFilters({
            subject: data.get('subject') as string,
            sender: data.get('sender') as string,
            hasAttachment: data.get('hasAttachment') === 'on',
        });
    };

    const stripHTMLAndStyles = (html: string) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        doc.querySelectorAll('style').forEach(style => style.remove());
        return doc.body.textContent || '';
    };

    const handleDownloadAttachment = (filename: string, base64Data: string) => {
        try {
            // Convert the correctly formatted base64 data to a Uint8Array for binary handling
            const binaryData = atob(base64Data);
            const byteArray = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
                byteArray[i] = binaryData.charCodeAt(i);
            }

            // Create a blob and download it as a file
            const blob = new Blob([byteArray], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error during file download:", error);
        }
    };
    const handlePageChange = (_event: unknown, newPage: number) => {
        setCurrentPage(newPage);
    };
    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(0); // Reset to the first page when rows per page changes
    };

    const toggleExpandEmail = (emailId: string) => {
        setExpandedEmailId(prevId => (prevId === emailId ? null : emailId));
    };

    useEffect(() => {
        if (microsoftToken && nextPageUrl) {
            fetch(nextPageUrl, {
                headers: { Authorization: `Bearer ${microsoftToken}` },
            })
                .then(response => response.json())
                .then(async data => {
                    const emailsWithAttachments = await Promise.all(
                        data.value.map(async (email: { hasAttachments: unknown; id: unknown; }) => {
                            if (email.hasAttachments) {
                                const attachmentResponse = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${email.id}/attachments`, {
                                    headers: { Authorization: `Bearer ${microsoftToken}` },
                                });
                                const attachmentData = await attachmentResponse.json();
                                return {
                                    ...email,
                                    attachments: attachmentData.value,
                                };
                            }
                            return email;
                        })
                    );
                    const emailData = emailsWithAttachments.map(email => ({
                        id: email.id,
                        subject: email.subject,
                        from: email.from?.emailAddress?.address,
                        body: email.body?.content,
                        attachments: email.attachments,
                    }));
                    dispatch(setEmails(emailData));
                    setNextPageUrl(data['@odata.nextLink'] || null);
                })
                .catch(error => console.error(error));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [microsoftToken, currentPage, rowsPerPage, dispatch]);
    return (
        <>
            <Header />
            <Container maxWidth={false}>
                <Box component="form" onSubmit={handleSubmit} display="flex" gap={3} mt={2} mb={3}>
                    <TextField name="subject" id="subject" label="Filter by subject" variant="outlined" />
                    <TextField name="sender" id="sender" label="Filter by sender" variant="outlined" />
                    <FormControlLabel
                        control={<Checkbox name="hasAttachment" color="primary" />}
                        label="Has Attachment"
                    />
                    <Button type="submit" variant="contained">Apply Filters</Button>
                </Box>
                {
                    loading ?
                        <Box display="flex" justifyContent="center">
                            <CircularProgress />
                        </Box>
                        :
                        emails && emails.length > 0 ?
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Sr.</TableCell>
                                            <TableCell>Subject</TableCell>
                                            <TableCell>From</TableCell>
                                            <TableCell>Body</TableCell>
                                            <TableCell>Attachment</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {emails.map((email, index) => (
                                            <TableRow key={email.id} onClick={() => toggleExpandEmail(email.id)}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{email.subject}</TableCell>
                                                <TableCell>{email.from}</TableCell>
                                                <TableCell>
                                                    {stripHTMLAndStyles(email.body).slice(0, 100)}...
                                                    {expandedEmailId === email.id && (
                                                        <div>
                                                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(email.body) }} />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {email?.attachments?.length > 0 ? (
                                                        <ul>
                                                            {email.attachments.map((attachment, index) => (
                                                                <li key={index}>
                                                                    {attachment.filename}
                                                                    {googleToken ?
                                                                        <Button onClick={() => handleDownloadAttachment(attachment.filename, attachment.data)}>Download</Button>
                                                                        :
                                                                        <a href={`data:${attachment?.contentType};base64,${attachment?.contentBytes}`} download={attachment?.name}>
                                                                            Download Attachment
                                                                        </a>
                                                                    }
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        'No Attachments'
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TablePagination
                                                colSpan={6}
                                                count={-1} // Since Gmail API might not return the total, use -1 for unknown total items
                                                page={currentPage}
                                                onPageChange={handlePageChange}
                                                rowsPerPage={rowsPerPage}
                                                onRowsPerPageChange={handleRowsPerPageChange}
                                                labelRowsPerPage="Emails per page"
                                                labelDisplayedRows={({ from, to }) => `${from}-${to}`}
                                            />
                                        </TableRow>
                                    </TableFooter>
                                </Table>

                            </TableContainer>
                            :
                            <Alert variant="filled" severity="warning">
                                No email found ...
                            </Alert>
                }
            </Container>
        </>
    );
};

export default Dashboard;
