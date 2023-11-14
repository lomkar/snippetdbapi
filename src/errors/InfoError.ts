import CustomError from "./CustomError";

class InfoError extends CustomError {
  errorCode = 400;
  errorType = "INFO_ERROR";

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, InfoError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export default InfoError;
