

export const checkAuth = (context: any) => {
    console.log("aad", context)
    console.log("aad", context?.variable1)
    console.log("context is", context?.headers)
    // console.log("data is", data)
}