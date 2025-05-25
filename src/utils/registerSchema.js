import * as Yup from "yup";

const registerSchema = Yup.object({
  fullName: Yup.string().required("Name can't be blank"),
  phone: Yup.string().required("Phone number can't be blank"),
  email: Yup.string().email("Invalid email format")
    .required("Email can't be blank"),
  password: Yup.string().min(6, "Tối thiểu 6 ký tự").required("Password can't be blank"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Confirm password is not match")
    .required("Confirm passowrd can't be blank"),
});

export default registerSchema;
