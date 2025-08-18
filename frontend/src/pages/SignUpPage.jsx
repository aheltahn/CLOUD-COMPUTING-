import { motion } from "framer-motion";
import Input from "../components/Input";
import { Loader, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useAuthStore } from "../store/authStore";

import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

const SignUpSchema = Yup.object().shape({
	name: Yup.string().required("Full Name is required"),
	email: Yup.string()
	  .trim()
	  .email("Invalid email format")
	  .matches(/^\S*$/, "No spaces allowed")
	  .required("Email is required"),
	password: Yup.string()
	  .min(6, "Password must be at least 6 characters")
	  .matches(/^\S*$/, "No spaces allowed")
	  .required("Password is required"),
  });
  

const SignUpPage = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const { signup, error, isLoading } = useAuthStore();

	const handleSignUp = async (e) => {
		e.preventDefault();

		try {
			await signup(email, password, name);
			navigate("/verify-email");
		} catch (error) {
			console.log(error);
		}
	};
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl 
			overflow-hidden'
		>
			<div className='p-8'>
				<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
					Create Account
				</h2>

				<Formik
  initialValues={{ name, email, password }}
  validationSchema={SignUpSchema}
  onSubmit={async (values) => {
    try {
      setName(values.name);
      setEmail(values.email);
      setPassword(values.password);
      await signup(values.email, values.password, values.name);
      navigate("/verify-email");
    } catch (err) {
      console.log(err);
    }
  }}
>
  {({ values, handleChange }) => (
    <Form>
      <Input
        icon={User}
        type="text"
        placeholder="Full Name"
        value={values.name}
        onChange={handleChange("name")}
      />
      <ErrorMessage
        name="name"
        component="p"
        className="text-red-500 mt-1 text-sm"
      />

      <Input
        icon={Mail}
        type="email"
        placeholder="Email Address"
        value={values.email}
        onChange={handleChange("email")}
      />
      <ErrorMessage
        name="email"
        component="p"
        className="text-red-500 mt-1 text-sm"
      />

      <Input
        icon={Lock}
        type="password"
        placeholder="Password"
        value={values.password}
        onChange={handleChange("password")}
      />
      <ErrorMessage
        name="password"
        component="p"
        className="text-red-500 mt-1 text-sm"
      />

      <PasswordStrengthMeter password={values.password} />

      <motion.button
        className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
        font-bold rounded-lg shadow-lg hover:from-green-600
        hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
         focus:ring-offset-gray-900 transition duration-200"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? <Loader className=" animate-spin mx-auto" size={24} /> : "Sign Up"}
      </motion.button>
    </Form>
  )}
</Formik>

			</div>
			<div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
				<p className='text-sm text-gray-400'>
					Already have an account?{" "}
					<Link to={"/login"} className='text-green-400 hover:underline'>
						Login
					</Link>
				</p>
			</div>
		</motion.div>
	);
};
export default SignUpPage;
