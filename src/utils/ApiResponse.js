class ApiResponse{
    constructor(statusCode, message, data){
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode >= 200 && statusCode < 300; // success if status code is in the range of 200-299
    }
}
export default ApiResponse;