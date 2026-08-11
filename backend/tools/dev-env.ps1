# Dot-source before any build/run command:  . C:\web\kanban\backend\tools\dev-env.ps1
$VsVcvarsAll = 'C:\Program Files\Microsoft Visual Studio\2022\Professional\VC\Auxiliary\Build\vcvarsall.bat'
$VsCMakeBin  = 'C:\Program Files\Microsoft Visual Studio\2022\Professional\Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin'
$VsNinjaBin  = 'C:\Program Files\Microsoft Visual Studio\2022\Professional\Common7\IDE\CommonExtensions\Microsoft\CMake\Ninja'
$VcpkgRoot   = 'C:\Program Files\Microsoft Visual Studio\2022\Professional\VC\vcpkg'

# Import vcvarsall's environment (cl.exe, INCLUDE, LIB, WindowsSDKVersion, ...)
cmd /c "`"$VsVcvarsAll`" x64 && set" | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        Set-Item -Path "Env:$($matches[1])" -Value $matches[2]
    }
}

$env:VCPKG_ROOT = $VcpkgRoot
$env:Path = "$VsCMakeBin;$VsNinjaBin;$VcpkgRoot;$env:Path"

Write-Host "Dev env ready. cl: $((Get-Command cl -ErrorAction SilentlyContinue).Source); cmake: $((Get-Command cmake -ErrorAction SilentlyContinue).Source)"
