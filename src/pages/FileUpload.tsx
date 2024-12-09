import { Box, Button, Chip, CircularProgress, Container, Paper, Typography } from "@mui/material";
import Header from "../component/Header";
import { useForm, Controller } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { FilesIcon } from "../component/CustomIcons";
import { useUploadFileMutation } from "../features/authApi";
import { useEffect, useState } from "react";
import { JsonEditor } from 'json-edit-react'

interface FormData {
    file: File | null;
}
type FileDataType = {
    FilePath: string;
    FileExtension: string;
};

const FileUpload = () => {
    const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false)
    const [previewContent, setPreviewContent] = useState<string | null>(null);
    const [fileData, setFileData] = useState<FileDataType[]>([]);
    const [jsonData, setJsonData] = useState<Record<string, any>>({});
    const [formData, setFormData] = useState<FormData | null>(null);
    const [isResetLoading, setIsResetLoading] = useState<boolean>(false)
    const [isProcessAgain, setIsProcessAgain] = useState<boolean>(false)

    const { control, handleSubmit, watch, setValue, reset } = useForm<FormData>({
        defaultValues: { file: null },
    });
    const file = watch("file");
    console.log("file", file)
    // Initialize useDropzone at the top level
    const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({
        onDrop: (acceptedFiles) => {
            console.log("acceptedFiles", acceptedFiles)
            if (acceptedFiles.length > 0) {
                const uploadedFile = acceptedFiles[0];
                console.log("uploadedFile", uploadedFile)
                setValue("file", uploadedFile); // Replace the file
            }
        },
        accept: {
            "image/*": [],
            "application/pdf": [], // PDF
            /*  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [], // Word (DOCX)
              "application/msword": [], // Word (DOC)
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [], // Excel (XLSX)
              "application/vnd.ms-excel": [], // Excel (XLS)
              "text/plain": [], // Text
              "message/rfc822": [], // Email (.eml)*/
        },
        multiple: false, // Disallow multiple file uploads
    });
    const [uploadFileMutation, { isLoading: isUploadFileLoading }] = useUploadFileMutation();

    const onSubmit = async (data: FormData, processAgain = true) => {
        // data.files.forEach((file, index) => {
        //     formData.append(`files[${index}]`, file);
        // });
        if (!data.file) {
            setIsFileUploaded(true)
            return;
        }
        setFormData(data);
        setIsFileUploaded(false)
        const formData = new FormData();
        formData.append("file", data.file);
        formData.append("process_again", processAgain ? "true" : "false");
        formData.append('client_id', '123');
        const response = await uploadFileMutation(formData);
        if (response?.data?.httpStatusCode === 200) {
            const PDFJsonData = await JSON.parse(response?.data?.response.PDFJsonData)
            setJsonData(PDFJsonData)
            generatePreview(response?.data?.response);
            setFileData(response?.data?.response);
            setIsResetLoading(false)
            setIsProcessAgain(false)
        }

    };
    const handleProcessAgain = () => {
        if (formData) {
            onSubmit(formData, true);
            setIsProcessAgain(true)
        }
    };
    const handleReset = () => {
        if (formData) {
            onSubmit(formData, false);
            setIsResetLoading(true)
        }
    }
    const generatePreview = async (fileData: { FilePath: string; FileExtension: string }) => {
        const { FilePath, FileExtension } = fileData;
        const fileUrl = await `http://${FilePath.replace(/\\\\/g, "/").replace(/^.+?\//, "")}`; // Convert UNC path to URL
        const extension = FileExtension.toLowerCase();

        if ([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg"].includes(extension)) {
            // Image Preview
            setPreviewContent(`<img src="${fileUrl}" alt="Image Preview" style="max-width: 100%; height: auto;" />`);
        } else if (extension === ".pdf") {
            // PDF Preview
            setPreviewContent(`<iframe src="${fileUrl}" width="100%" height="100%" frameBorder="0"></iframe>`);
        } else if ([".docx", ".doc", ".xlsx", ".xls"].includes(extension)) {
            // Word/Excel Preview via Google Docs Viewer
            const encodedUrl = encodeURIComponent(fileUrl);
            setPreviewContent(
                `<iframe src="https://docs.google.com/viewer?url=${encodedUrl}&embedded=true" width="100%" height="100%" frameBorder="0"></iframe>`
            );
        } else if ([".txt", ".eml"].includes(extension)) {
            // Text or Email Preview
            try {
                const response = await fetch(fileUrl);
                if (!response.ok) {
                    throw new Error(`Error fetching file: ${response.statusText}`);
                }
                const content = await response.text();
                setPreviewContent(content);
            } catch (error) {
                console.error("File preview error:", error);
                setPreviewContent("Unable to preview this file.");
            }
        } else {
            setPreviewContent("Preview not available. You can download the file.");
        }
    };
    const renderPreview = () => {
        if (!file) return null;

        return (
            <Box height="100%" dangerouslySetInnerHTML={{ __html: previewContent || "" }} />
        );
    };
    useEffect(() => {
        // Cleanup Blob URLs
        return () => {
            if (previewContent && file?.type !== "text/plain" && file?.type !== "message/rfc822") {
                URL.revokeObjectURL(previewContent);
            }
        };
    }, [previewContent, file]);

    const handleEdit = (event: { newValue: any; path: (string | number)[] }) => {
        const { newValue, path } = event;
        if (!jsonData) return;
        console.log(newValue)
        const updatedData = { ...jsonData };
        let current: any = updatedData;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        current[path[path.length - 1]] = newValue;
        setJsonData(updatedData);
    };

    // const handleJSONSubmit = async () => {
    //     console.log(jsonData.data)
    // };

    const handleFileUploadClick = () => {
        setFileData([]);
        reset();
    };

    return (
        <>
            <Header onFileUploadClick={handleFileUploadClick} />
            {Object.keys(fileData).length > 0 &&
                <Box position="fixed" left={0} top={70} bottom={0} bgcolor="white" width="40%">
                    {renderPreview()}
                </Box>
            }
            <Container sx={{ ml: Object.keys(fileData).length > 0 ? '40%' : 'auto', maxWidth: `calc(100% - 40%) !important`, position: 'relative' }}>
                {Object.keys(fileData).length > 0 ?
                    <>
                        <Box position="absolute" zIndex={1} top="10px" right="50px" gap={2} display="flex">
                            <Button
                                type="button"
                                variant="contained"
                                onClick={handleReset}
                                color="warning"
                                disabled={isResetLoading}
                            >
                                {isResetLoading ?
                                    <Box display="flex" gap={2}>Loading <CircularProgress size={25} /></Box>
                                    :
                                    'Reset'
                                }
                            </Button>
                            <Button
                                type="button"
                                variant="contained"
                                onClick={handleProcessAgain}
                                color="primary"
                                disabled={isProcessAgain}
                            >
                                {isProcessAgain ?
                                    <Box display="flex" gap={2}>Loading <CircularProgress size={25} /></Box>
                                    :
                                    'Process Again'
                                }
                            </Button>
                            {/* <Button
                                type="button"
                                variant="contained"
                                onClick={handleJSONSubmit}
                                color="primary"
                            > Submit
                            </Button> */}
                        </Box>
                        <Paper elevation={3} sx={{ mt: 3, height: 'calc(100vh - 115px)', overflow: 'auto' }}>
                            {isUploadFileLoading ?
                                <Box height="100%" display="flex" justifyContent="center" alignItems="center">
                                    <CircularProgress size={36} />
                                </Box>
                                :
                                <JsonEditor
                                    data={jsonData}
                                    onEdit={handleEdit}
                                    defaultValue="New data!"
                                    showCollectionCount="when-closed"
                                    minWidth="100%"
                                    theme="githubLight"
                                    onAdd={jsonData?.onAdd ?? undefined}
                                />
                            }
                        </Paper>
                    </>
                    :
                    <Paper elevation={3} sx={{ p: 2, mt: 3, bgcolor: "#f5fbfe" }}>
                        <Box component="form" onSubmit={handleSubmit((data) => onSubmit(data))} noValidate>
                            <Controller
                                name="file"
                                control={control}
                                render={() => (
                                    <>
                                        <Typography variant="h5" fontWeight={700} mb={2}>Upload the document</Typography>
                                        <Box
                                            {...getRootProps()}
                                            sx={{
                                                border: "1px dashed #e6e6e6",
                                                bgcolor: "#fff",
                                                borderRadius: "8px",
                                                padding: "24px",
                                                textAlign: "center",
                                                cursor: "pointer",
                                                ...(isDragActive || isFocused ? { borderColor: "#0093e7" } : {}),
                                                ...(isFileUploaded && !file ? { borderColor: "#e53e3e" } : {})
                                            }}
                                        >
                                            <input {...getInputProps()} />
                                            <Typography color="primary">
                                                <FilesIcon />
                                            </Typography>
                                            <Typography mb={1}>
                                                Drop the file here...
                                            </Typography>
                                            <Button variant="outlined">Select file</Button>
                                            {file &&
                                                <Box mt={1}>
                                                    <Chip
                                                        label={file.name}
                                                        onDelete={() => {
                                                            setValue("file", null);
                                                        }}
                                                        sx={{ margin: 0.5 }}
                                                    />
                                                </Box>
                                            }
                                        </Box>
                                        {isFileUploaded && !file && <Typography color="error">Please select file</Typography>}
                                    </>
                                )}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                sx={{ mt: 3, mx: 'auto', display: 'flex', flex: '0 0 200px' }}
                                disabled={isUploadFileLoading}
                            >
                                {isUploadFileLoading ?
                                    <Box display="flex" gap={2}>Loading <CircularProgress size={25} /></Box>
                                    :
                                    'Submit'
                                }
                            </Button>
                        </Box>
                    </Paper>
                }
            </Container>
        </>
    );
};

export default FileUpload;
