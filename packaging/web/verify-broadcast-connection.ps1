[CmdletBinding()]
param(
    [string]$PrivateIcecastHost = "10.98.98.75",
    [int]$PrivateIcecastPort = 11154,
    [string]$LoopbackApiBaseUrl = "http://127.0.0.1:8000",
    [switch]$Strict
)

$ErrorActionPreference = "Stop"

function Get-HttpStatus([string]$Uri, [string]$Method = "HEAD") {
    try {
        $request = [Net.HttpWebRequest]::Create($Uri)
        $request.Method = $Method
        $request.Timeout = 5000
        $request.AllowAutoRedirect = $false
        $response = $request.GetResponse()
        try { return [int]$response.StatusCode } finally { $response.Dispose() }
    } catch [Net.WebException] {
        if ($null -ne $_.Exception.Response) {
            try { return [int]$_.Exception.Response.StatusCode } finally { $_.Exception.Response.Dispose() }
        }
        return $null
    }
}

$tcp = Test-NetConnection -ComputerName $PrivateIcecastHost -Port $PrivateIcecastPort -InformationLevel Quiet
$privateMounts = [ordered]@{}
foreach ($mount in @("en", "fr")) {
    $privateMounts[$mount] = Get-HttpStatus "http://${PrivateIcecastHost}:${PrivateIcecastPort}/$mount"
}

$api = [ordered]@{}
foreach ($station in @("radiotedu-en", "radiotedu-fr")) {
    $api[$station] = Get-HttpStatus "$($LoopbackApiBaseUrl.TrimEnd('/'))/v1/radio/stations/$station/status" "GET"
}

$apiReady = @($api.Values | Where-Object { $_ -eq 200 }).Count -eq 2
$mountsExplicit = @($privateMounts.Values | Where-Object { $null -ne $_ }).Count -eq 2
$ok = [bool]($tcp -and $apiReady -and $mountsExplicit)

[ordered]@{
    checked_at = (Get-Date).ToUniversalTime().ToString("o")
    private_icecast = [ordered]@{
        host = $PrivateIcecastHost
        port = $PrivateIcecastPort
        tcp_reachable = [bool]$tcp
        mount_http_status = $privateMounts
    }
    loopback_api_status = $api
    connection_ready = $ok
    credentials_logged = $false
} | ConvertTo-Json -Depth 6

if ($Strict -and -not $ok) { exit 1 }
