import { useRef, useState, useEffect } from 'react';
import './CircleProgress.css';
import { gsap } from 'gsap';
import Clock from './icons/Clock';

interface CircleProgressProps {
    width: number;
    height: number;
    setIsAnimating: (value: boolean) => void;
}

const CircleProgress: React.FC<CircleProgressProps> = ({ width, height, setIsAnimating }) => {
    const CIRCLE_RADIUS = 42;
    const ANIMATION_DURATION = 10;

    const [isAnimating, setLocalIsAnimating] = useState(false);
    const [remainingTime, setRemainingTime] = useState(ANIMATION_DURATION);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const circleRef = useRef(null);
    const circumference = 2 * Math.PI * CIRCLE_RADIUS;

    const handleClick = () => {
        if (isAnimating) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            animateCircle(ctx);
        }
        setLocalIsAnimating(true);
        setIsAnimating(true);
        setRemainingTime(ANIMATION_DURATION);
    };

    useEffect(() => {
        if (isAnimating) {
            gsap.fromTo(circleRef.current,
                {
                    strokeDasharray: circumference,
                    strokeDashoffset: 0,
                },
                {
                    duration: ANIMATION_DURATION,
                    strokeDashoffset: circumference,
                    ease: 'linear',
                    onComplete: endAnimation,
                }
            );

            const timerInterval = setInterval(() => {
                setRemainingTime(prev => {
                    if (prev <= 1) {
                        clearInterval(timerInterval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timerInterval);
        }
    }, [isAnimating]);

    const endAnimation = () => {
        setLocalIsAnimating(false);
        setIsAnimating(false);
    };

    const animateCircle = (ctx: CanvasRenderingContext2D) => {
        let startTime: number;
        const duration = ANIMATION_DURATION * 1000;
        const particles: any[] = [];

        const createParticle = (x: number, y: number) => {
            const particle = {
                x: x,
                y: y,
                radius: Math.random() * 1.2 + 1,
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
                const x = width / 2 + (Math.min(width, height) / 2) * Math.cos(angle);
                const y = height / 2 + (Math.min(width, height) / 2 - (50 - CIRCLE_RADIUS)) * Math.sin(angle);
                createParticle(x, y);
                updateParticles();
                drawParticles();
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    };

    const BackgroundCircle = () => (
        <svg className="circle-svg" viewBox="0 0 100 100">
            <circle id="background-circle" cx="50" cy="50" r="50" />
            <circle id="background-circle-path" cx="50" cy="50" r={CIRCLE_RADIUS} />
        </svg>
    );

    // Utility function to format time
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        } else if (m > 0) {
            return `${m}:${s.toString().padStart(2, '0')}`;
        } else {
            return `${s} sec`;
        }
    };

    // Define prop types for TimerComponent
    interface TimerComponentProps {
        remainingTime: number;
    }

    const TimerComponent: React.FC<TimerComponentProps> = ({ remainingTime }) => (
        <div className="timer-container">
            <svg viewBox="0 0 24 24" width="24" height="24" style={{ transform: 'rotate(90deg) scaleX(-1)' }}>
                <Clock size={24} />
            </svg>
            <span>{formatTime(remainingTime)}</span>
        </div>
    );

    return (
        <div className={isAnimating ? 'test' : ''} onClick={handleClick}>
            {isAnimating && <BackgroundCircle />}
            <svg className="circle-svg" viewBox="0 0 100 100">
                <defs>
                    <filter id="blur-filter" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" />
                    </filter>
                    <mask id="mask">
                        <circle cx="50" cy="50" r={CIRCLE_RADIUS} fill="white" />
                    </mask>
                </defs>
                <circle
                    id="circle-path"
                    cx="50"
                    cy="50"
                    r={CIRCLE_RADIUS}
                    ref={circleRef}
                    style={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                />
                <circle
                    id="circle-path"
                    cx="50"
                    cy="50"
                    r={CIRCLE_RADIUS}
                    filter="url(#blur-filter)"
                    mask="url(#mask)"
                    style={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                />
            </svg>
            {isAnimating && <TimerComponent remainingTime={remainingTime} />}
            <canvas ref={canvasRef} id="particles-canvas" width={width} height={height} />
        </div>
    );
}

export default CircleProgress;