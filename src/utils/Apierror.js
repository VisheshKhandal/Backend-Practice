// This is a custom error class that extends Node's built-in Error class to create more structured and informative API errors.
// ApiError is a custom, structured error that carries statusCode, message, and details — making error handling clean and consistent across your entire API. 🚀
class Apierror extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if(stack) {
            this.stack = stack;
        }
        else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default Apierror;