// RequestHandler så vi slipper ange typ på req,res,next
const logger = (req, res, next) => {
    console.log(`${req.method}  ${req.url}`);
    next();
};
export { logger };
