import { IconProps } from "../utils/types";


const Clock: React.FC<IconProps> = ({ size = 24, className = "" }) => {

    const svgSize = `${size}px`;

    return (
        <svg fill="currentColor" className={className} height={svgSize} width={svgSize} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M21.8 12.8c-.5 5.4-5.2 9.4-10.6 8.9-5.4-.5-9.4-5.2-8.9-10.6.4-4.7 4.2-8.5 8.9-8.9.4 0 .8.3.8.7 0 .4-.3.8-.7.8-4.5.4-7.9 4.4-7.5 8.9s4.4 7.9 8.9 7.5c4-.3 7.2-3.5 7.5-7.5 0-.4.4-.7.8-.7.5.1.8.5.8.9zM15 4.5c.6 0 1.1-.5 1.1-1.1s-.5-1.2-1.1-1.2-1.1.5-1.1 1.1.5 1.2 1.1 1.2zm3.4 2.3c.6 0 1.1-.5 1.1-1.1s-.5-1.2-1.1-1.2-1.2.5-1.2 1.1.6 1.2 1.2 1.2zm2.2 3.3c.6 0 1.1-.5 1.1-1.1s-.5-1.1-1.1-1.1-1.1.5-1.1 1.1.5 1.1 1.1 1.1zM12 5.2c3.7 0 6.8 3 6.8 6.8s-3 6.8-6.8 6.8-6.8-3-6.8-6.8c.1-3.7 3.1-6.7 6.8-6.8zm-.8 6.8c0 .4.3.8.8.8h4.5c.4 0 .8-.3.8-.8s-.3-.8-.8-.8h-3.8V7.5c0-.4-.3-.8-.8-.8s-.8.3-.8.8V12z" fill="currentColor"></path></g></svg>
    );
};

export default Clock;