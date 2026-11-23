interface ErrorMessage {
    code:number,
    status:string,
    message:string
}

export function ApiError(status: number, code: string, message: string) {
    const error = new Error(message) as any;
    error.status = status;
    error.code = code;
    return error;
}