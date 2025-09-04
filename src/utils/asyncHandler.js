const asyncHandler = (requestHander) => {
    return (req, res, next) => {
        Promise.resolve(requestHander(req, res, next))
            .catch((err) => {
                next(err)
            })
    }
}
export { asyncHandler }

/*
Using the try catch
    const asyncHandler = (requestHander) => async(req, res, next){
        try{
            await requestHandler(req, res, next)
        } catch(err){
            res.status(err.code).json({
                success: false,
                message: err.message
            }) 
        }
    }
*/