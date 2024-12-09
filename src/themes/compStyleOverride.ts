interface Theme {
    colors: Record<string, any>;
    customization: Record<string, any>;
}

export const componentStyleOverrides = (theme:Theme) => {
    return {
        MuiButton: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                }
            }
        },
        MuiCardHeader: {
            styleOverrides: {
                root: {
                    padding: '16px 20px'
                },
                title: {
                    fontSize: '1.125rem',
                    color: theme?.colors?.primaryMain,
                }
            }
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    '&:last-child': {
                        padding: 0
                    }
                }
            }
        },
        MuiCardActions: {
            styleOverrides: {
                root: {
                    padding: '16px 20px'
                }
            }
        },
        MuiDataGrid: {
            styleOverrides: {
                root: {
                    borderWidth: '1px 0 0 0',
                    borderRadius: 0,
                    '& .MuiDataGrid-main > *:first-of-type': {
                        borderRadius: 0,
                    },
                    '& .MuiDataGrid-columnHeaders [role=row]': {
                        '& .MuiDataGrid-columnHeaderTitle': {
                            fontWeight:700,
                        }
                    },
                },
            },
        },
    };
}