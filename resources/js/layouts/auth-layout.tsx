import FlashToasterListener from '@/components/flash-toaster-listener';
import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({ children, title, description, ...props }: { children: React.ReactNode; title: string; description: string }) {
    return (
        <AuthLayoutTemplate title={title} description={description} {...props}>
            <FlashToasterListener />
            {children}
        </AuthLayoutTemplate>
    );
}
