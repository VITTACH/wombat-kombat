import { useRef, useState } from 'react';
import './SvgComponent.css';

interface SvgComponentProps {
    width: number;
    height: number;
    setIsAnimating: (value: boolean) => void;
}

const SvgComponent: React.FC<SvgComponentProps> = ({ width, height, setIsAnimating }) => {
    const [isAnimating, setLocalIsAnimating] = useState(false);

    const canvasParticalsRef = useRef<HTMLCanvasElement | null>(null);

    const handleClick = () => {
        if (isAnimating) return;
        const canvas = canvasParticalsRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
            animateCircle(ctx);
        }
        setLocalIsAnimating(true);
        setIsAnimating(true);
    };

    const cancelAnimation = () => {
        setLocalIsAnimating(false);
        setIsAnimating(false);
    };

    const animateCircle = (ctx: CanvasRenderingContext2D) => {
        let startTime: number;
        const duration = 10000;
        const particles: any[] = [];

        const createParticle = (x: number, y: number) => {
            const particle = {
                x: x,
                y: y,
                radius: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) / 1.2,
                vy: (Math.random() - 0.5) / 1.2,
                alpha: 1
            };
            particles.push(particle);
        };

        const updateParticles = () => {
            for (let i = 0; i < particles.length; i++) {
                const particle = particles[i];
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.alpha -= 0.01;
                if (particle.alpha <= 0) {
                    particles.splice(i, 1);
                    i--;
                }
            }
        };

        const drawParticles = () => {
            for (const particle of particles) {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 213, 0, ${particle.alpha})`;
                ctx.fill();
            }
        };

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            if (progress < 1) {
                const angle = progress * 2 * Math.PI - Math.PI / 2;
                const x = width / 2 + (Math.min(width, height) / 2 - 2) * Math.cos(angle);
                const y = height / 2 + (Math.min(width, height) / 2 - 8) * Math.sin(angle);
                createParticle(x, y);
                updateParticles();
                drawParticles();
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    };

    return (
        <div className={isAnimating ? 'test' : ''} onClick={handleClick}>
            {
                isAnimating && <svg className="circle-svg" viewBox="0 0 100 100">
                    <circle id="background-circle-path" cx="50" cy="50" r="46" />
                </svg>
            }
            <svg className="circle-svg" viewBox="0 0 100 100" onAnimationEnd={() => cancelAnimation()}>
                <defs>
                    <filter id="blur-filter" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
                    </filter>
                    <mask id="mask">
                        <circle cx="50" cy="50" r="42" fill="white" />
                    </mask>
                </defs>
                <circle id="circle-path" cx="50" cy="50" r="42" />
                <circle id="circle-path" cx="50" cy="50" r="42" filter="url(#blur-filter)" mask="url(#mask)" />
            </svg>
            <canvas ref={canvasParticalsRef} id="particles-canvas" width={width} height={height}></canvas>
        </div>
    );
}

export default SvgComponent;