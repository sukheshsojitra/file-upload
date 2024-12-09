import { useState } from 'react'
import { Box, Button, Chip, Typography } from '@mui/material';
import { useForm, Controller } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { FilesIcon } from '../component/CustomIcons';

interface FormData {
    file: File | null;
}

export default function DropFile() {
    const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false)
    const { control, handleSubmit, watch, setValue } = useForm<FormData>({
        defaultValues: { file: null },
    });
    const file = watch("file");
    console.log("file", file)

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
    const onSubmit = async (data: FormData) => {
        if (!data.file) {
            setIsFileUploaded(true)
            return;
        }
        console.log(data)
    }
    return (
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
            >
                Submit
            </Button>
        </Box>
    )
}
