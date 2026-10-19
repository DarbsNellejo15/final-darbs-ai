/**
 * DARBS Offline Diagnostic Knowledge Base & Emergency Fallback Generator
 * Provides structured diagnostic workflows for common PC and laptop faults
 * when offline or when an external API key is awaiting setup.
 */

export function generateOfflineDiagnosticFallback(
  userQuery: string,
  persona: string = "hardware_laptop"
): string {
  const q = userQuery.toLowerCase();

  // 1. Slow Laptop / High Disk / Performance Bottlenecks
  if (
    q.includes("slow") ||
    q.includes("lag") ||
    q.includes("freeze") ||
    q.includes("freezing") ||
    q.includes("100% disk") ||
    q.includes("100% cpu") ||
    q.includes("bottleneck") ||
    q.includes("ram") ||
    q.includes("performance") ||
    persona === "performance_storage"
  ) {
    return `### ⚡ DARBS Performance & Speed Diagnostic Protocol

I analyzed your report regarding laptop slowness and sluggish performance. A slow computer is typically caused by background startup bloatware, 100% disk utilization, thermal throttling, or low RAM capacity.

---

### 🛠️ Step-by-Step Fix Protocol:

#### 1. Investigate Resource Hogs in Task Manager
1. Press **Ctrl + Shift + Esc** to launch **Task Manager**.
2. Select the **Processes** tab and click on the **CPU**, **Memory**, and **Disk** columns to sort by highest usage.
3. Switch to the **Startup Apps** tab and **Disable** non-essential applications (Spotify, Discord, Epic Games, OneDrive) from booting automatically with Windows.

#### 2. Resolve 100% Disk Usage (SysMain & Windows Search)
In **Command Prompt as Administrator** (**Win + S**, type \`cmd\`, right-click ➔ *Run as administrator*):
\`\`\`cmd
net stop sysmain
sc config sysmain start=disabled
\`\`\`

#### 3. Run System Health & File Scans
Repair corrupted OS files that degrade system responsiveness:
\`\`\`cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
\`\`\`

#### 4. Clean Temporary Caches & Junk
Press **Win + R**, type \`cleanmgr\`, select your **C: drive**, check **Temporary Files** and **DirectX Shader Cache**, and click **OK**.

---
> 💡 **DARBS Hardware Tip**: If your operating system runs on a mechanical HDD (Hard Disk Drive), cloning Windows to a SATA or NVMe Solid State Drive (SSD) will give you a 5x–10x speed improvement instantly.`;
  }

  // 2. Blue Screen of Death (BSOD) & System Crashes
  if (
    q.includes("bsod") ||
    q.includes("blue screen") ||
    q.includes("stop code") ||
    q.includes("crash") ||
    q.includes("reboot") ||
    q.includes("minidump") ||
    persona === "windows_bsod"
  ) {
    return `### 🚨 DARBS Blue Screen (BSOD) Diagnostic & Crash Recovery

Blue Screen errors occur when the Windows NT kernel encounters an unrecoverable hardware fault, conflicting kernel-mode driver, or memory corruption.

---

### 🛠️ Step-by-Step Fix Protocol:

#### 1. Execute System File Integrity Scans
Open **Command Prompt as Administrator** (**Win + S**, type \`cmd\`, right-click ➔ *Run as administrator*):
\`\`\`cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
\`\`\`

#### 2. Test RAM for Bad Sectors & Memory Errors
1. Press **Win + R**, type \`mdsched.exe\` and hit Enter.
2. Select **"Restart now and check for problems"**.
3. Allow the Windows Memory Diagnostic to complete two passes. If errors are flagged, reseat or replace your RAM sticks.

#### 3. Inspect Minidump Crash Logs
1. Navigate to: \`C:\\Windows\\Minidump\\\`
2. Download free **BlueScreenView** or use **WinDbg** to inspect the faulting \`.sys\` driver module (e.g., \`nvlddmkm.sys\` for Nvidia GPU, \`netwtw.sys\` for Intel Wi-Fi).

---
> 💡 **DARBS Advisory**: If the crash started right after a Windows or driver update, boot into Safe Mode (**Shift + Restart** ➔ *Troubleshoot* ➔ *Advanced* ➔ *Startup Settings*) and roll back the recent driver in **Device Manager**.`;
  }

  // 3. Wi-Fi, Internet & Network Problems
  if (
    q.includes("wifi") ||
    q.includes("wi-fi") ||
    q.includes("internet") ||
    q.includes("disconnect") ||
    q.includes("no internet") ||
    q.includes("ping") ||
    q.includes("dns") ||
    persona === "network_wifi"
  ) {
    return `### 🌐 DARBS Network & Wi-Fi Diagnostic Workflow

Network drops on laptops are commonly caused by aggressive adapter power-saving settings, corrupted DNS caches, or outdated wireless NIC drivers.

---

### 🛠️ Step-by-Step Fix Protocol:

#### 1. Complete Network & DNS Stack Flush
Open **Command Prompt as Administrator** and execute:
\`\`\`cmd
ipconfig /flushdns
ipconfig /release
ipconfig /renew
netsh winsock reset
netsh int ip reset
\`\`\`
*(Restart your laptop after running these commands).*

#### 2. Disable Wi-Fi Adapter Sleep Mode
1. Press **Win + X** ➔ select **Device Manager**.
2. Expand **Network adapters**, right-click your Wi-Fi card (e.g., Intel Wi-Fi 6, Realtek Wireless) ➔ **Properties**.
3. Under the **Power Management** tab, **uncheck**: *"Allow the computer to turn off this device to save power"*.

#### 3. Switch to Ultra-Fast Public DNS
Change your IPv4 DNS in Network Properties to Cloudflare or Google:
- **Primary DNS**: \`1.1.1.1\` (or \`8.8.8.8\`)
- **Secondary DNS**: \`1.0.0.1\` (or \`8.8.4.4\`)

---
> 💡 **DARBS Diagnostic Check**: If 5GHz Wi-Fi is invisible while 2.4GHz works, adjust your router's wireless channel width or update your wireless adapter drivers directly from the manufacturer.`;
  }

  // 4. Overheating, Fan Noise & Battery Health
  if (
    q.includes("battery") ||
    q.includes("heat") ||
    q.includes("hot") ||
    q.includes("fan") ||
    q.includes("thermal") ||
    q.includes("temperature") ||
    q.includes("shutdown")
  ) {
    return `### 🛠️ DARBS Thermal & Battery Health Inspection

High temperatures trigger CPU/GPU thermal throttling, leading to stuttering, loud fan whining, and sudden shutdowns.

---

### 🛠️ Step-by-Step Fix Protocol:

#### 1. Generate an Official Windows Battery Health Report
Open **Command Prompt as Administrator** and run:
\`\`\`cmd
powercfg /batteryreport /output "C:\\battery-report.html"
\`\`\`
Open \`C:\\battery-report.html\` in your browser. Compare **Design Capacity** vs **Full Charge Capacity**. If Full Charge Capacity is under 60% of Design Capacity, the battery cell is degraded and needs replacement.

#### 2. Clean Air Vents & Fans
- Inspect the intake and exhaust grilles under the laptop chassis.
- Use a can of compressed air in short bursts to clear dust blocks from heatsink fins.

#### 3. Thermal Paste & Elevated Surface
- Elevate the rear of the laptop by 1 inch to increase bottom intake airflow.
- If your laptop is 2+ years old, repasting with high-grade thermal paste (e.g., Arctic MX-4, Noctua NT-H1) typically drops core temps by 10°C–20°C.

---
> ⚠️ **Safety Warning**: If your laptop chassis is bulging or the trackpad is lifting, the lithium-ion battery has swollen. Stop charging immediately and safely replace the battery.`;
  }

  // 5. Default General PC Troubleshooting
  return `### 💻 DARBS Diagnostic & Repair Workflow

I have processed your request regarding: **"${userQuery.slice(0, 70)}"**. Here is the recommended diagnostic sequence:

---

### 🛠️ Universal First-Response Troubleshooting Protocol:

#### 1. Run Windows System Integrity Scans
Open **Command Prompt as Administrator** (**Win + S**, type \`cmd\`, right-click ➔ *Run as administrator*):
\`\`\`cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
\`\`\`

#### 2. Inspect Hardware Health in Device Manager
Press **Win + X** ➔ select **Device Manager**. Check for any devices bearing a yellow warning triangle ⚠️ indicating a driver fault or missing firmware.

#### 3. Check Windows Reliability Monitor
Press **Win + R**, type \`perfmon /rel\` and press Enter. This displays a day-by-day stability index and highlights the exact app or service that crashed.

---
> 💬 **DARBS Next Step**: Tell me your laptop's brand/model (e.g., Lenovo ThinkPad, Dell XPS, ASUS ROG) or error codes, and DARBS will give you an exact tailored hardware repair guide!`;
}
