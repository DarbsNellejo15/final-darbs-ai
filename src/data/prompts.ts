import { PersonaType } from "../types";

export interface StarterPrompt {
  id: string;
  title: string;
  category: "Performance" | "BSOD & Errors" | "Network" | "Hardware" | "Repairs";
  prompt: string;
  iconName: string;
}

export const STARTER_PROMPTS: StarterPrompt[] = [
  {
    id: "1",
    title: "100% Disk & CPU Usage",
    category: "Performance",
    prompt: "My laptop is lagging severely with Task Manager showing 100% Disk and high CPU usage. How do I diagnose the offending process and fix this step-by-step?",
    iconName: "Cpu",
  },
  {
    id: "2",
    title: "Blue Screen (BSOD) Error",
    category: "BSOD & Errors",
    prompt: "I got a Windows Blue Screen of Death with stop code 'CRITICAL_PROCESS_DIED' / 'DPC_WATCHDOG_VIOLATION'. How do I analyze minidump logs and fix the crashing driver?",
    iconName: "AlertTriangle",
  },
  {
    id: "3",
    title: "Wi-Fi Disconnects Frequently",
    category: "Network",
    prompt: "My laptop Wi-Fi keeps disconnecting randomly every few minutes. How do I reset the network stack, update WLAN drivers, and disable power management throttling?",
    iconName: "Wifi",
  },
  {
    id: "4",
    title: "Overheating & Fan Noise",
    category: "Hardware",
    prompt: "My laptop fans run at maximum speed constantly and the CPU temperature reaches 90°C+. What thermal diagnostics, airflow checks, and undervolting/cleaning steps should I take?",
    iconName: "Flame",
  },
  {
    id: "5",
    title: "Run SFC & DISM System Repair",
    category: "Repairs",
    prompt: "Can you provide the exact administrator Command Prompt commands to run DISM Cleanup-Image, SFC /scannow, and CHKDSK to repair corrupted Windows system files safely?",
    iconName: "Terminal",
  },
  {
    id: "6",
    title: "Low Disk Space on Drive C:",
    category: "Performance",
    prompt: "My Windows C: drive is almost full with only 2GB free. How can I safely clear temporary files, Windows Update caches, hibernation files, and old restore points?",
    iconName: "HardDrive",
  },
];

export const PERSONA_CONFIGS: Record<
  PersonaType,
  { name: string; description: string; badge: string; color: string }
> = {
  hardware_laptop: {
    name: "Laptop Troubleshooter",
    description: "Deep diagnostics for laptop thermals, battery health, screens, keyboards, and hardware repairs.",
    badge: "Laptop Troubleshooter",
    color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800",
  },
  windows_bsod: {
    name: "Windows & BSOD Specialist",
    description: "Decodes stop codes, memory dump files, kernel crashes, registry repairs, and bootloader recovery.",
    badge: "BSOD & Kernel Specialist",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  },
  performance_storage: {
    name: "Performance & Storage Optimizer",
    description: "Identifies 100% RAM/Disk/CPU bottlenecks, bloatware cleanup, and SSD health optimization.",
    badge: "Performance & Storage",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  },
  network_wifi: {
    name: "Network & Adapter Troubleshooter",
    description: "Fixes DNS leaks, intermittent Wi-Fi drops, packet loss, DHCP conflicts, and network cards.",
    badge: "Network & Wi-Fi",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/30 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
  },
  driver_software: {
    name: "Drivers & Bug Support",
    description: "GPU drivers (DDU clean install), BIOS/UEFI firmware updates, peripheral errors, and software conflicts.",
    badge: "Drivers & Bug Support",
    color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
  },
};


