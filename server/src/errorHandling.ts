interface ErrorMessage {
    code:number,
    status:string,
    message:string
}

export function ApiError(code:number, status:string, message:string) {
  const err:ErrorMessage = {
    code:code,
    status:status,
    message:message
  };
  return err;
}