import {MainComponent} from "@/app/main/_components/MainComponent";
import {Suspense} from "react";

export default function Main() {
    return (
        <Suspense>
            <MainComponent />
        </Suspense>
    )
}