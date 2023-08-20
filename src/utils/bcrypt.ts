import bcrypt from "bcrypt"

export const compareAsync = (param1: any, param2: any) => {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(param1, param2, function(err, res) {
            if (err) {
                 reject(err);
            } else {
                 resolve(res);
            }
        });
    });
}