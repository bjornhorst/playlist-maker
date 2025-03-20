import { toast, Bounce, ToastOptions, ToastPosition } from "react-toastify";

const toastOptions: ToastOptions = {
    position: "top-center" as ToastPosition, // ✅ Explicitly define type
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    transition: Bounce,
};

export const Helper = {
    toast: {
        ShowSuccess: (message: string) => toast.success(message, toastOptions),
        ShowError: (message: string) => toast.error(message, toastOptions),
        ShowWarning: (message: string) => toast.warning(message, toastOptions),
        ShowInfo: (message: string) => toast.info(message, toastOptions),
    }
};
