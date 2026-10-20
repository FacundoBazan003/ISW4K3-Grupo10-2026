import type { HTMLAttributes, RefAttributes } from "react";

declare global {
    namespace React.JSX {
        interface IntrinsicElements {
            "calendar-date": HTMLAttributes<HTMLElement> &
                RefAttributes<HTMLElement> & {
                    class?: string;
                    value?: string;
                    min?: string;
                    max?: string;
                };
            "calendar-month": HTMLAttributes<HTMLElement> &
                RefAttributes<HTMLElement> & {
                    class?: string;
                };
        }
    }
}
