import * as Yup from "yup";

const loginSchema = Yup.object({
    email: Yup.string()
        .email("Invalid email format")
        .required("Email can't be blank"),
    password: Yup.string().required("Password can't be blank"),
});

export default loginSchema;