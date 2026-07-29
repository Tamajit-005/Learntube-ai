"use client";

import Link from "next/link";
import type { ElementType } from "react";
import { motion } from "framer-motion";
import {
	BookOpen,
	Brain,
	Briefcase,
	FileText,
	LayoutGrid,
	Sigma,
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
];

const stack: StackItem[] = [
	{ name: "Next.js", icon: FileText },
	{ name: "TypeScript", icon: FileText },
	{ name: "Tailwind CSS", icon: LayoutGrid },
	{ name: "Framer Motion", icon: Zap },
	{ name: "FastAPI", icon: Zap },
	{ name: "MongoDB", icon: BookOpen },
	{ name: "Auth0", icon: BookOpen },
	{ name: "Gemini API", icon: Zap },
];

const stats: Stat[] = [
	{ value: "5", label: "Study tools" },
	{ value: "AI", label: "Generated materials" },
	{ value: "Secure", label: "User sessions" },
	{ value: "Responsive", label: "Across devices" },
];

const workflow: WorkflowStep[] = [
	{
		title: "Paste YouTube Link",
		description: "Start with any educational video.",
		icon: FileText,
	},
	{
		title: "AI Processing",
		description: "Analyze transcript and context.",
		icon: Zap,
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
		icon: BookOpen,
	},
];

const team: TeamMember[] = [
	{
		name: "Mayukh Ghosh",
		role: "Frontend Developer & Database Integration",
		initials: "MG",
		contributions: [
			"Implemented MongoDB integration and persistent user history.",
			"Built the local history management system (current/previous sessions).",
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
			"Built the local history management system (current/previous sessions).",
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

export default function AboutPage() {
	return (
		<main className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
			<section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
					className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8 lg:p-10"
				>
					<div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300">
						Product overview
					</div>

					<div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
						<div>
							<motion.h1
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
								className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl"
							>
								Learn Smarter with AI
							</motion.h1>

							<motion.p
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.16, ease: "easeOut" }}
								className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl"
							>
								LearnTube AI transforms educational YouTube videos into structured learning resources using AI. Generate notes, quizzes, flashcards, interview questions, and formulas in seconds to make studying faster, smarter, and more effective.
							</motion.p>

							<motion.div
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.24, ease: "easeOut" }}
								className="mt-7 flex flex-wrap gap-3"
							>
								<Link
									href="/"
									className="inline-flex items-center justify-center rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
								>
									Analyze a Video
								</Link>
								<button
									type="button"
									aria-label="GitHub repository coming soon"
									title="GitHub repository coming soon"
									className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-violet-400 dark:hover:text-violet-300"
								>
									GitHub Repository
								</button>
							</motion.div>
						</div>

						<motion.aside
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
							className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
						>
							<div className="flex items-center gap-4">
								<div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
									<BookOpen className="h-7 w-7" />
								</div>
								<div>
									<p className="text-sm font-medium uppercase tracking-wider text-violet-600 dark:text-violet-300">
										LearnTube AI
									</p>
									<p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
										A product built for focused revision
									</p>
								</div>
							</div>

							<div className="mt-6 space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
								{[
									"Convert lectures into clear study assets.",
									"Practice with quizzes and flashcards.",
									"Review saved sessions anytime.",
								].map((item) => (
									<div key={item} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
										<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
										<span>{item}</span>
									</div>
								))}
							</div>

							<div className="mt-6 grid gap-3 sm:grid-cols-2">
								{stats.map((stat) => (
									<div
										key={stat.label}
										className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
									>
										<p className="text-2xl font-semibold text-slate-950 dark:text-white">
											{stat.value}
										</p>
										<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
											{stat.label}
										</p>
									</div>
								))}
							</div>
						</motion.aside>
					</div>
				</motion.div>
			</section>

			<section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, ease: "easeOut" }}
					className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
				>
					<div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
						<div>
							<p className="text-sm font-medium uppercase tracking-wider text-violet-600 dark:text-violet-300">
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

			<section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.15 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					<div className="mb-8">
						<p className="text-sm font-medium uppercase tracking-wider text-violet-600 dark:text-violet-300">
							Features
						</p>
						<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
							Everything you need for efficient revision
						</h2>
					</div>

					<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
						{features.map((feature, i) => {
							const Icon = feature.icon;

							return (
								<motion.article
									key={feature.title}
									initial={{ opacity: 0, y: 16 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
									className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
								>
									<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
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

			<section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-12">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, ease: "easeOut" }}
					className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
				>
					<div className="mb-8">
						<p className="text-sm font-medium uppercase tracking-wider text-violet-600 dark:text-violet-300">
							How It Works
						</p>
						<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
							A simple flow from video to revision
						</h2>
					</div>

					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						{workflow.map((step, index) => {
							const Icon = step.icon;

							return (
								<motion.article
									key={step.title}
									initial={{ opacity: 0, y: 12 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
									className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50"
								>
									<div className="flex items-start gap-4">
										<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
											<Icon className="h-6 w-6" />
										</div>
										<div className="min-w-0">
											<div className="flex items-center gap-2">
												<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700 dark:bg-violet-900 dark:text-violet-300">
													{String(index + 1).padStart(2, "0")}
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

			<section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-20 lg:pt-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, ease: "easeOut" }}
					className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
				>
					<div className="mb-6">
						<p className="text-sm font-medium uppercase tracking-wider text-violet-600 dark:text-violet-300">
							Technology Stack
						</p>
						<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
							Modern tools powering the experience
						</h2>
					</div>

					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{stack.map((item) => {
							const Icon = item.icon;

							return (
								<motion.div
									key={item.name}
									initial={{ opacity: 0, y: 8 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.3, ease: "easeOut" }}
									className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-4 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
								>
									<span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
										<Icon className="h-5 w-5" />
									</span>
									<span>{item.name}</span>
								</motion.div>
							);
						})}
					</div>
				</motion.div>
			</section>

			<section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.18 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
					className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
				>
					<div className="mb-8">
						<p className="text-sm font-medium uppercase tracking-wider text-violet-600 dark:text-violet-300">
							Meet the Team
						</p>
						<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
							People behind LearnTube AI
						</h2>
					</div>

					<div className="grid gap-5 lg:grid-cols-3">
						{team.map((member, index) => (
							<motion.article
								key={member.name}
								initial={{ opacity: 0, y: 16 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
								className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50"
							>
								<div className="flex items-start gap-4">
									<div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-lg font-semibold text-white shadow-sm ${index === 0 ? "bg-violet-600" : index === 1 ? "bg-fuchsia-600" : "bg-slate-700"}`}>
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
