// This is a wrapper function to handle asynchronous request handlers in Express.js.
// It takes a request handler function as an argument and returns a new function that wraps the original handler in a Promise.
// If the original handler throws an error, it will be caught and passed to the next middleware (error handler) in the Express.js pipeline.
// This helps to avoid repetitive try-catch blocks in each request handler and ensures that errors are properly handled and propagated.
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((err) => next(err));
    }
}
export default asyncHandler;




 
// This is an alternative implementation of the asyncHandler function using async/await syntax.
// const aynchandler = (fn) => async(req,res,next) =>{
//     try{
//         await fn(req,res,next);
//     }
//     catch(error){
//         res.status(error.code || 500).json({
//             success : false,
//             message : error.message || "Internal Server Error"
//         })
         
//     }

// }