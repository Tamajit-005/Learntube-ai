"use client";

import Link from "next/link";
import type { ElementType } from "react";
import { motion } from "framer-motion";
import {
	BadgeInfo,
	Bot,
	BookOpen,
	Brain,
	Briefcase,
	Code2,
	Database,
	FileText,
	LayoutGrid,
	Link2,
	Lock,
	ShieldCheck,
	Sigma,
	Sparkles,
	Type,
	Zap,
} from "lucide-react";

type Feature = {
	title: string;
	description: string;
	icon: ElementType;
};

type StackItem = {
	name: string;
	icon: ElementType;
};

type Stat = {
	value: string;
	label: string;
};

type WorkflowStep = {
	title: string;
	description: string;
	icon: ElementType;
};

type TeamMember = {
	name: string;
	role: string;
	initials: string;
	contributions: string[];
};

const features: Feature[] = [
	{
		title: "AI Notes",
		description: "Turn videos into structured notes with clean headings and key takeaways.",
		icon: FileText,
	},
	{
		title: "AI Quiz Generation",
		description: "Create practice questions that help you test understanding quickly.",
		icon: Brain,
	},
	{
		title: "Flashcards",
		description: "Review important ideas faster with concise study cards.",
		icon: LayoutGrid,
	},
	{
		title: "Interview Preparation",
		description: "Generate domain-focused interview prompts for revision and practice.",
		icon: Briefcase,
	},
	{
		title: "Formula Extraction",
		description: "Capture essential formulas and equations from lecture content.",
		icon: Sigma,
	},
	{
		title: "Session History",
		description: "Return to previous analyses and continue learning without losing progress.",
		icon: BadgeInfo,
	},
	{
		title: "Secure Authentication",
		description: "Keep user sessions protected with a secure sign-in flow.",
		icon: Lock,
	},
	{
		title: "Fast AI Processing",
		description: "Generate learning materials quickly so study sessions stay productive.",
		icon: Zap,
	},
];

const stack: StackItem[] = [
	{ name: "Next.js", icon: Code2 },
	{ name: "TypeScript", icon: Type },
	{ name: "Tailwind CSS", icon: LayoutGrid },
	{ name: "Framer Motion", icon: Sparkles },
	{ name: "FastAPI", icon: Bot },
	{ name: "MongoDB", icon: Database },
	{ name: "Auth0", icon: Lock },
	{ name: "OpenAI API", icon: ShieldCheck },
];

const stats: Stat[] = [
	{ value: "8", label: "Study tools" },
	{ value: "AI", label: "Generated materials" },
	{ value: "Secure", label: "User sessions" },
	{ value: "Responsive", label: "Across devices" },
];

const workflow: WorkflowStep[] = [
	{
		title: "Paste YouTube Link",
		description: "Start with any educational video.",
		icon: Code2,
	},
	{
		title: "AI Processing",
		description: "Analyze transcript and context.",
		icon: Bot,
	},
	{
		title: "Generate Notes",
		description: "Create a structured summary.",
		icon: FileText,
	},
	{
		title: "Quiz",
		description: "Test understanding with questions.",
		icon: Brain,
	},
	{
		title: "Flashcards",
		description: "Review key concepts quickly.",
		icon: LayoutGrid,
	},
	{
		title: "Interview Questions",
		description: "Practice advanced prompts.",
		icon: Briefcase,
	},
	{
		title: "Revision",
		description: "Return to your saved study flow.",
		icon: BadgeInfo,
	},
];

const team: TeamMember[] = [
	{
		name: "Mayukh Ghosh",
		role: "Frontend Developer & Database Integration",
		initials: "MG",
		contributions: [
			"Developed major frontend components and interface improvements.",
			"Implemented MongoDB integration and persistent user history.",
			"Refined the UI and improved overall user experience.",
		],
	},
	{
		name: "Tamajit Saha",
		role: "Frontend Developer & Authentication",
		initials: "TS",
		contributions: [
			"Developed frontend components and page layouts.",
			"Implemented the authentication system.",
			"Built login, registration, password management, and auth flows.",
		],
	},
	{
		name: "Sumon Sen",
		role: "Project Mentor",
		initials: "SS",
		contributions: [
			"Designed the overall project architecture.",
			"Built the Python/FastAPI backend project structure.",
			"Guided the technical direction of LearnTube AI.",
		],
	},
];

const fadeUp = {
	hidden: { opacity: 0, y: 24 },
	visible: { opacity: 1, y: 0 },
};

const stagger = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.09,
		},
	},
};

export default function AboutPage() {
	return (
		<main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.14),_transparent_28%),linear-gradient(to_bottom,rgba(248,250,252,0.98),rgba(248,250,252,1))] text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.2),_transparent_28%),linear-gradient(to_bottom,rgba(2,6,23,0.98),rgba(15,23,42,1))] dark:text-slate-100">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute left-1/2 top-[-10rem] h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl dark:bg-violet-500/25" />
				<div className="absolute right-[-6rem] top-40 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl dark:bg-sky-400/10" />
			</div>

			<section className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
				<motion.div
					className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-[0_24px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 sm:p-8 lg:p-10"
					initial="hidden"
					animate="visible"
					variants={stagger}
				>
					<div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-700 dark:text-violet-300">
						<Sparkles className="h-4 w-4" />
						Product overview
					</div>

					<div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
						<div>
							<motion.h1
								variants={fadeUp}
								transition={{ duration: 0.65, ease: "easeOut" }}
								className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl"
							>
								Learn Smarter with AI
							</motion.h1>

							<motion.p
								variants={fadeUp}
								transition={{ duration: 0.65, delay: 0.08, ease: "easeOut" }}
								className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl"
							>
								LearnTube AI transforms educational YouTube videos into structured learning resources using AI. Generate notes, quizzes, flashcards, interview questions, and formulas in seconds to make studying faster, smarter, and more effective.
							</motion.p>

							<motion.div
								variants={fadeUp}
								transition={{ duration: 0.65, delay: 0.14, ease: "easeOut" }}
								className="mt-7 flex flex-wrap gap-3"
							>
								<Link
									href="/"
									className="inline-flex items-center justify-center rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition duration-200 hover:-translate-y-0.5 hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
								>
									Analyze a Video
								</Link>
								<button
									type="button"
									aria-label="GitHub repository coming soon"
									title="GitHub repository coming soon"
									className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-violet-400/40 dark:hover:text-violet-300"
								>
									<Link2 className="mr-2 h-4 w-4" />
									GitHub Repository
								</button>
							</motion.div>
						</div>

						<motion.aside
							variants={fadeUp}
							transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
							className="rounded-[1.75rem] border border-white/60 bg-white/70 p-5 shadow-[0_20px_60px_-30px_rgba(124,58,237,0.5)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 sm:p-6"
						>
							<div className="flex items-center gap-4">
								<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/10 text-violet-600 dark:text-violet-300">
									<BookOpen className="h-7 w-7" />
								</div>
								<div>
									<p className="text-sm font-medium uppercase tracking-[0.24em] text-violet-600 dark:text-violet-300">
										LearnTube AI
									</p>
									<p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
										A product built for focused revision
									</p>
								</div>
							</div>

							<div className="mt-6 space-y-3 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
								{[
									"Convert lectures into clear study assets.",
									"Practice with quizzes and flashcards.",
									"Review saved sessions anytime.",
								].map((item) => (
									<div key={item} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
										<span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600/10 text-violet-600 dark:text-violet-300">
											<ShieldCheck className="h-3.5 w-3.5" />
										</span>
										<span>{item}</span>
									</div>
								))}
							</div>

							<div className="mt-6 grid gap-3 sm:grid-cols-2">
								{stats.map((stat) => (
									<div
										key={stat.label}
										className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5"
									>
										<p className="text-2xl font-semibold text-slate-950 dark:text-white">
											{stat.value}
										</p>
										<p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
											{stat.label}
										</p>
									</div>
								))}
							</div>
						</motion.aside>
					</div>
				</motion.div>
			</section>

			<section className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.2 }}
					variants={fadeUp}
					className="rounded-[2rem] border border-violet-500/15 bg-white/70 p-6 shadow-[0_20px_70px_-38px_rgba(124,58,237,0.35)] backdrop-blur-xl dark:border-violet-400/10 dark:bg-slate-950/55 sm:p-8"
				>
					<div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
						<div>
							<p className="text-sm font-medium uppercase tracking-[0.24em] text-violet-600 dark:text-violet-300">
								Mission
							</p>
							<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
								A clearer way to learn from video.
							</h2>
						</div>
						<p className="max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
							Our mission is to simplify learning by transforming educational video content into interactive study materials powered by artificial intelligence, helping students revise efficiently and learn more effectively.
						</p>
					</div>
				</motion.div>
			</section>

			<section id="features" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.15 }}
					variants={stagger}
				>
					<motion.div variants={fadeUp} className="mb-8">
						<p className="text-sm font-medium uppercase tracking-[0.24em] text-violet-600 dark:text-violet-300">
							Features
						</p>
						<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
							Everything you need for efficient revision
						</h2>
					</motion.div>

					<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
						{features.map((feature) => {
							const Icon = feature.icon;

							return (
								<motion.article
									key={feature.title}
									variants={fadeUp}
									whileHover={{ y: -4 }}
									transition={{ duration: 0.2, ease: "easeOut" }}
									className="group rounded-[1.75rem] border border-white/60 bg-white/70 p-6 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.32)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55"
								>
									<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/10 text-violet-600 transition-transform duration-200 group-hover:scale-105 dark:text-violet-300">
										<Icon className="h-6 w-6" />
									</div>
									<h3 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">
										{feature.title}
									</h3>
									<p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
										{feature.description}
									</p>
								</motion.article>
							);
						})}
					</div>
				</motion.div>
			</section>

			<section id="how-it-works" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-12">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.2 }}
					variants={stagger}
					className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.32)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 sm:p-8"
				>
					<motion.div variants={fadeUp} className="mb-8">
						<p className="text-sm font-medium uppercase tracking-[0.24em] text-violet-600 dark:text-violet-300">
							How It Works
						</p>
						<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
							A simple flow from video to revision
						</h2>
					</motion.div>

					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						{workflow.map((step, index) => {
							const Icon = step.icon;

							return (
								<motion.article
									key={step.title}
									variants={fadeUp}
									whileHover={{ y: -4 }}
									transition={{ duration: 0.2, ease: "easeOut" }}
									className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
								>
									<div className="flex items-start gap-4">
										<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600/10 text-violet-600 dark:text-violet-300">
											<Icon className="h-6 w-6" />
										</div>
										<div className="min-w-0">
											<div className="flex items-center gap-2">
												<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600/10 text-[0.7rem] font-semibold text-violet-700 dark:text-violet-300">
													0{index + 1}
												</span>
												<p className="text-sm font-semibold text-slate-950 dark:text-white">
													{step.title}
												</p>
											</div>
											<p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
												{step.description}
											</p>
										</div>
									</div>
								</motion.article>
							);
						})}
					</div>
				</motion.div>
			</section>

			<section id="stack" className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-20 lg:pt-8">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.2 }}
					variants={stagger}
					className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.32)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 sm:p-8"
				>
					<motion.div variants={fadeUp} className="mb-6">
						<p className="text-sm font-medium uppercase tracking-[0.24em] text-violet-600 dark:text-violet-300">
							Technology Stack
						</p>
						<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
							Modern tools powering the experience
						</h2>
					</motion.div>

					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{stack.map((item) => {
							const Icon = item.icon;

							return (
								<motion.div
									key={item.name}
									variants={fadeUp}
									whileHover={{ y: -3 }}
									transition={{ duration: 0.18, ease: "easeOut" }}
									className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4 text-sm font-medium text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
								>
									<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-300">
										<Icon className="h-5 w-5" />
									</span>
									<span>{item.name}</span>
								</motion.div>
							);
						})}
					</div>
				</motion.div>
			</section>

			<section id="team" className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.18 }}
					variants={stagger}
					className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.32)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 sm:p-8"
				>
					<motion.div variants={fadeUp} className="mb-8">
						<p className="text-sm font-medium uppercase tracking-[0.24em] text-violet-600 dark:text-violet-300">
							Meet the Team
						</p>
						<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
							People behind LearnTube AI
						</h2>
					</motion.div>

					<div className="grid gap-5 lg:grid-cols-3">
						{team.map((member, index) => (
							<motion.article
								key={member.name}
								variants={fadeUp}
								whileHover={{ y: -4 }}
								transition={{ duration: 0.2, ease: "easeOut" }}
								className="rounded-[1.75rem] border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
							>
								<div className="flex items-start gap-4">
									<div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold text-white shadow-lg ${index === 0 ? "bg-violet-600 shadow-violet-600/25" : index === 1 ? "bg-fuchsia-600 shadow-fuchsia-600/25" : "bg-slate-800 shadow-slate-900/20"}`}>
										{member.initials}
									</div>
									<div>
										<h3 className="text-lg font-semibold text-slate-950 dark:text-white">
											{member.name}
										</h3>
										<p className="mt-1 text-sm font-medium text-violet-600 dark:text-violet-300">
											{member.role}
										</p>
									</div>
								</div>

								<ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
									{member.contributions.map((item) => (
										<li key={item} className="flex items-start gap-3">
											<span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</motion.article>
						))}
					</div>
				</motion.div>
			</section>
		</main>
	);
}
