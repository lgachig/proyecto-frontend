import Header from "./Header";
import '../globals.css';

export default function ComponentsLayout({
    children,
    }: {
    children: React.ReactNode;
    }) {
    return (<>

        <Header/>

        <div className="flex flex-1 flex-col overflow-hidden">
        {children}
        </div>
    </>
    );
    }