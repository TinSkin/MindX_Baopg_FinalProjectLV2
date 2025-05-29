import * as Yup from "yup";

// Regex: không cho phép chỉ toàn dấu cách
const noOnlySpaces = /^(?!\s+$).*/;

const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Email không đúng định dạng")
    .required("Vui lòng nhập email"),

  password: Yup.string()
    .trim()
    .matches(noOnlySpaces, "Mật khẩu không được chỉ chứa khoảng trắng")
    .required("Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
      "Mật khẩu phải chứa ít nhất 1 chữ và 1 số"
    ),
});

export default loginSchema;
