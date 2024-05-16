export const fileSend = () => ({
    type: 'FILE_SEND',
    
});

export const fileSendSuccess = (fileData) => ({
    type: 'FILE_SEND_SUCCESS',
    payload: fileData,

});

export const fileSendFail = (errorMessage) => ({
    type: 'FILE_SEND_FAILURE',
    payload: errorMessage,

});