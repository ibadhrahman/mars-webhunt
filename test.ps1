# Automated Verification Test for Set 2: Signal From Mars
$code = @'
using System;
public class Hasher {
    public static ulong Cyrb53(string s) {
        uint h1 = 0xdeadbeef;
        uint h2 = 0x41c6ce57;
        for (int i = 0; i < s.Length; i++) {
            uint c = (uint)s[i];
            h1 = (uint)((long)(h1 ^ c) * 2654435761L);
            h2 = (uint)((long)(h2 ^ c) * 1597334677L);
        }
        h1 = (uint)((long)(h1 ^ (h1 >> 16)) * 2246822507L);
        h1 ^= (uint)((long)(h2 ^ (h2 >> 13)) * 3266489909L);
        h2 = (uint)((long)(h2 ^ (h2 >> 16)) * 2246822507L);
        h2 ^= (uint)((long)(h1 ^ (h1 >> 13)) * 3266489909L);
        return 4294967296UL * (2097151UL & (ulong)h2) + (ulong)h1;
    }
}
'@

Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue

$marsDir = $PSScriptRoot
Write-Output "Testing Set 2 in directory: $marsDir"

# Expected hashes from terminal.js
$expectedHashes = @{
    1 = [UInt64]1959640243283381 # beacon
    2 = [UInt64]7141386553768035 # 7492
    3 = [UInt64]895228863433749  # mars
    4 = [UInt64]7474891140204748 # phobos
}

$answers = @{
    1 = "beacon"
    2 = "7492"
    3 = "mars"
    4 = "phobos"
}

# 1. Verify Hash Integrity
foreach ($page in 1..4) {
    $word = $answers[$page]
    $calculated = [Hasher]::Cyrb53("mars:" + $word)
    $expected = $expectedHashes[$page]
    if ($calculated -ne $expected) {
        throw "Hash mismatch on Page ${page}: calculated $calculated, expected $expected"
    }
    Write-Output "✓ Page ${page} hash verified for '$word': $calculated"
}

# 2. Check File Existence
$files = @("index.html", "oxygen.html", "roster.html", "starmap.html", "transmission.html", "terminal.css", "terminal.js")
foreach ($f in $files) {
    $path = Join-Path $marsDir $f
    if (!(Test-Path $path)) {
        throw "Missing required file: $f"
    }
    Write-Output "✓ File exists: $f"
}

# 3. Verify Page 1 Clue: Morse code decodes to BEACON
$indexContent = Get-Content (Join-Path $marsDir "index.html") -Raw
if ($indexContent -notmatch "− · · ·") { throw "Morse code missing from index.html" }
Write-Output "✓ Page 1 contains Morse code distress clue for BEACON"

# 4. Verify Page 2 Clue: Multi-channel telemetry waveform
$oxygenContent = Get-Content (Join-Path $marsDir "oxygen.html") -Raw
if ($oxygenContent -notmatch "CH-A: O₂ Pressure" -or $oxygenContent -notmatch "CYCLE I" -or $oxygenContent -notmatch "CYCLE IV") {
    throw "Oxygen telemetry monitor missing from oxygen.html"
}
Write-Output "✓ Page 2 contains multi-channel waveform telemetry for PIN 7492"

# 5. Verify Page 3 Clue: Rank Order Marcus (M), Alena (A), Rex (R), Sara (S)
$rosterContent = Get-Content (Join-Path $marsDir "roster.html") -Raw
if ($rosterContent -notmatch "Vance" -or $rosterContent -notmatch "Rostova" -or $rosterContent -notmatch "Thorne" -or $rosterContent -notmatch "Chen") {
    throw "Crew names missing from roster.html"
}
Write-Output "✓ Page 3 contains rank order initials M-A-R-S for MARS"

# 6. Verify Page 4 Clue: Stars Vega, Deneb, Altair, Polaris
$starmapContent = Get-Content (Join-Path $marsDir "starmap.html") -Raw
if ($starmapContent -notmatch "VEGA" -or $starmapContent -notmatch "DENEB" -or $starmapContent -notmatch "ALTAIR" -or $starmapContent -notmatch "POLARIS") {
    throw "Star alignment stars missing from starmap.html"
}
Write-Output "✓ Page 4 contains constellation sequence VEGA -> DENEB -> ALTAIR -> POLARIS"

# 7. Verify Page 5 Clue: Reversed buffer SOBOHP - SRAM - 2947 - NOCAEB
$transContent = Get-Content (Join-Path $marsDir "transmission.html") -Raw
if ($transContent -notmatch "SOBOHP - SRAM - 2947 - NOCAEB") {
    throw "Reversed transmission missing from transmission.html"
}
Write-Output "✓ Page 5 contains reversed transmission buffer"

# 8. Verify Master Passcode for Next Set
$masterPasscode = "BEACON-7492-MARS-PHOBOS"
$masterHash = [Hasher]::Cyrb53("mars:" + $masterPasscode.ToLower())
if ($masterHash -ne [UInt64]975247915806302) {
    throw "Master passcode hash mismatch: $masterHash"
}
Write-Output "✓ Master Passcode for Next Set verified: $masterPasscode (hash: $masterHash)"

Write-Output "`n================================================"
Write-Output "ALL SET 2 VERIFICATION CHECKS PASSED PERFECTLY!"
Write-Output "================================================"
