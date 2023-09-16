
interface TestUserInput {
    name: string
}

var controller = {
    message: () => ({
        ok: true,
        message: "asd"
    }),
    testUser: ({ name }: TestUserInput) => {
        return {
            ok: true,
            message: name
        }
    }
};



export default controller;