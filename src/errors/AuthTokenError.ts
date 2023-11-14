import CustomError from "./CustomError";

class AuthTokenError extends CustomError {
  errorCode = 401;
  errorType = "AUTHTOKEN_ERROR";

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, AuthTokenError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export default AuthTokenError;
