# PowerShell Script to Generate Placeholder Images for Royal Eleganto Website
# This script creates basic placeholder images with gradients and text overlays

# Add System.Drawing assembly
Add-Type -AssemblyName System.Drawing

# Define color scheme to match website design
$darkColor = [System.Drawing.Color]::FromArgb(26, 26, 26)    # Dark background color #1a1a1a
$lightDarkColor = [System.Drawing.Color]::FromArgb(36, 36, 36) # Slightly lighter dark color
$goldColor = [System.Drawing.Color]::FromArgb(212, 175, 55)  # Gold accent color #d4af37
$lightColor = [System.Drawing.Color]::FromArgb(248, 248, 248) # Light color #f8f8f8
$whiteColor = [System.Drawing.Color]::White

# Paths
$basePath = "C:\Users\ngobe\royal-eleganto\images"
$heroPath = "$basePath\hero"
$aboutPath = "$basePath\about"
$galleryPath = "$basePath\gallery"

# Font settings
$fontFamily = "Arial"
$fontBold = [System.Drawing.FontStyle]::Bold

# Helper function to create gradient background
function Create-GradientBackground {
    param (
        [System.Drawing.Graphics]$graphics,
        [System.Drawing.Rectangle]$rectangle,
        [System.Drawing.Color]$startColor,
        [System.Drawing.Color]$endColor,
        [bool]$isVertical = $true
    )
    
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rectangle,
        $startColor,
        $endColor,
        $(if ($isVertical) {90} else {0})
    )
    
    $graphics.FillRectangle($brush, $rectangle)
    $brush.Dispose()
}

# Helper function to add text overlay
function Add-TextOverlay {
    param (
        [System.Drawing.Graphics]$graphics,
        [string]$text,
        [System.Drawing.Color]$textColor,
        [System.Drawing.Rectangle]$rectangle,
        [int]$fontSize = 24,
        [string]$fontType = $fontFamily,
        [System.Drawing.FontStyle]$fontStyle = $fontBold
    )
    
    $font = New-Object System.Drawing.Font($fontType, $fontSize, $fontStyle)
    $stringFormat = New-Object System.Drawing.StringFormat
    $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $graphics.DrawString($text, $font, [System.Drawing.SolidBrush]$textColor, $rectangle, $stringFormat)
    
    $font.Dispose()
    $stringFormat.Dispose()
}

# Helper function to add a decorative element (like a gold line)
function Add-DecorativeElement {
    param (
        [System.Drawing.Graphics]$graphics,
        [System.Drawing.Rectangle]$rectangle,
        [System.Drawing.Color]$color
    )
    
    # Calculate line position (below text)
    $lineWidth = $rectangle.Width * 0.3
    $lineHeight = 3
    $lineX = $rectangle.X + ($rectangle.Width - $lineWidth) / 2
    $lineY = $rectangle.Y + ($rectangle.Height * 0.6)
    
    $pen = New-Object System.Drawing.Pen($color, $lineHeight)
    $graphics.DrawLine($pen, $lineX, $lineY, $lineX + $lineWidth, $lineY)
    
    $pen.Dispose()
}

# Function to add a pattern overlay
function Add-PatternOverlay {
    param (
        [System.Drawing.Graphics]$graphics,
        [System.Drawing.Rectangle]$rectangle,
        [System.Drawing.Color]$color,
        [int]$spacing = 40
    )
    
    $pen = New-Object System.Drawing.Pen($color, 1)
    
    # Create a dot pattern
    for ($x = 0; $x -lt $rectangle.Width; $x += $spacing) {
        for ($y = 0; $y -lt $rectangle.Height; $y += $spacing) {
            $dotSize = 3
            $dotX = $rectangle.X + $x
            $dotY = $rectangle.Y + $y
            
            # Draw a small circle or square as a dot
            $dotRect = New-Object System.Drawing.Rectangle($dotX, $dotY, $dotSize, $dotSize)
            $graphics.FillEllipse([System.Drawing.SolidBrush]$color, $dotRect)
        }
    }
    
    $pen.Dispose()
}

# Helper function to add a logo placeholder
function Add-LogoPlaceholder {
    param (
        [System.Drawing.Graphics]$graphics,
        [System.Drawing.Rectangle]$rectangle,
        [System.Drawing.Color]$color
    )
    
    # Draw a circle as logo placeholder
    $logoSize = [Math]::Min($rectangle.Width, $rectangle.Height) * 0.15
    $logoX = $rectangle.X + ($rectangle.Width - $logoSize) / 2
    $logoY = $rectangle.Y + ($rectangle.Height * 0.25) - ($logoSize / 2)
    
    $logoRect = New-Object System.Drawing.Rectangle($logoX, $logoY, $logoSize, $logoSize)
    $graphics.FillEllipse([System.Drawing.SolidBrush]$color, $logoRect)
    
    # Draw a smaller inner circle
    $innerSize = $logoSize * 0.7
    $innerX = $logoX + ($logoSize - $innerSize) / 2
    $innerY = $logoY + ($logoSize - $innerSize) / 2
    
    $innerRect = New-Object System.Drawing.Rectangle($innerX, $innerY, $innerSize, $innerSize)
    $graphics.FillEllipse([System.Drawing.SolidBrush]$darkColor, $innerRect)
    
    # Add a text "RE" inside the logo
    $font = New-Object System.Drawing.Font($fontFamily, $innerSize * 0.4, $fontBold)
    $stringFormat = New-Object System.Drawing.StringFormat
    $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $graphics.DrawString("RE", $font, [System.Drawing.SolidBrush]$color, 
        $innerX + ($innerSize / 2), $innerY + ($innerSize / 2), $stringFormat)
    
    $font.Dispose()
    $stringFormat.Dispose()
}

Write-Host "Creating placeholder images for Royal Eleganto website..."

# 1. Create Hero Image (1920x1080)
Write-Host "Creating hero image..."
$heroImage = New-Object System.Drawing.Bitmap(1920, 1080)
$g = [System.Drawing.Graphics]::FromImage($heroImage)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

# Create gradient background
$rect = New-Object System.Drawing.Rectangle(0, 0, 1920, 1080)
Create-GradientBackground -graphics $g -rectangle $rect -startColor $darkColor -endColor $lightDarkColor

# Add subtle pattern
Add-PatternOverlay -graphics $g -rectangle $rect -color ([System.Drawing.Color]::FromArgb(50, $goldColor.R, $goldColor.G, $goldColor.B)) -spacing 80

# Add logo placeholder
Add-LogoPlaceholder -graphics $g -rectangle $rect -color $goldColor

# Add main text
$textRect = New-Object System.Drawing.Rectangle(0, $rect.Height * 0.4, $rect.Width, $rect.Height * 0.2)
Add-TextOverlay -graphics $g -text "ROYAL ELEGANTO" -textColor $whiteColor -rectangle $textRect -fontSize 72

# Add subtitle
$subtitleRect = New-Object System.Drawing.Rectangle(0, $rect.Height * 0.55, $rect.Width, $rect.Height * 0.1)
Add-TextOverlay -graphics $g -text "ELEGANCE REDEFINED" -textColor ([System.Drawing.Color]::FromArgb(200, $whiteColor.R, $whiteColor.G, $whiteColor.B)) -rectangle $subtitleRect -fontSize 36

# Add decorative element
Add-DecorativeElement -graphics $g -rectangle $textRect -color $goldColor

# Save the image
$heroImagePath = "$heroPath\hero-placeholder.jpg"
$heroImage.Save($heroImagePath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$g.Dispose()
$heroImage.Dispose()

# 2. Create About Image (800x600)
Write-Host "Creating about image..."
$aboutImage = New-Object System.Drawing.Bitmap(800, 600)
$g = [System.Drawing.Graphics]::FromImage($aboutImage)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

# Create gradient background (different direction)
$rect = New-Object System.Drawing.Rectangle(0, 0, 800, 600)
Create-GradientBackground -graphics $g -rectangle $rect -startColor $lightDarkColor -endColor $darkColor -isVertical $false

# Add subtle pattern
Add-PatternOverlay -graphics $g -rectangle $rect -color ([System.Drawing.Color]::FromArgb(40, $goldColor.R, $goldColor.G, $goldColor.B)) -spacing 60

# Add text
$textRect = New-Object System.Drawing.Rectangle(0, $rect.Height * 0.4, $rect.Width, $rect.Height * 0.2)
Add-TextOverlay -graphics $g -text "ABOUT US" -textColor $whiteColor -rectangle $textRect -fontSize 48

# Add subtitle
$subtitleRect = New-Object System.Drawing.Rectangle(0, $rect.Height * 0.55, $rect.Width, $rect.Height * 0.1)
Add-TextOverlay -graphics $g -text "Our Story of Excellence" -textColor ([System.Drawing.Color]::FromArgb(200, $whiteColor.R, $whiteColor.G, $whiteColor.B)) -rectangle $subtitleRect -fontSize 24

# Add decorative element
Add-DecorativeElement -graphics $g -rectangle $textRect -color $goldColor

# Save the image
$aboutImagePath = "$aboutPath\about-placeholder.jpg"
$aboutImage.Save($aboutImagePath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$g.Dispose()
$aboutImage.Dispose()

# 3. Create Gallery Images (6 images of 400x400)
Write-Host "Creating gallery images..."
$categories = @("Design", "Luxury", "Styling", "Innovation", "Craftsmanship", "Elegance")
$descriptions = @(
    "Elegant interior concepts",
    "Luxury materials and finishes",
    "Sophisticated styling options",
    "Innovative design solutions",
    "Exceptional craftsmanship",
    "Timeless elegance in detail"
)

for ($i = 0; $i -lt 6; $i++) {
    $galleryImage = New-Object System.Drawing.Bitmap(400, 400)
    $g = [System.Drawing.Graphics]::FromImage($galleryImage)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    
    # Create background (alternating patterns)
    $rect = New-Object System.Drawing.Rectangle(0, 0, 400, 400)
    
    if ($i % 2 -eq 0) {
        # Even numbered images - darker with vertical gradient
        Create-GradientBackground -graphics $g -rectangle $rect -startColor $darkColor -endColor $lightDarkColor
    }
    else {
        # Odd numbered images - lighter with horizontal gradient
        Create-GradientBackground -graphics $g -rectangle $rect -startColor $lightDarkColor -endColor $darkColor -isVertical $false
    }
    
    # Add pattern based on image number
    $patternSpacing = 50 + ($i * 5)
    Add-PatternOverlay -graphics $g -rectangle $rect -color ([System.Drawing.Color]::FromArgb(30 + ($i * 5), $goldColor.R, $goldColor.G, $goldColor.B)) -spacing $patternSpacing
    
    # Add category name
    $textRect = New-Object System.Drawing.Rectangle(0, $rect.Height * 0.4, $rect.Width, $rect.Height * 0.15)
    Add-TextOverlay -graphics $g -text $categories[$i].ToUpper() -textColor $whiteColor -rectangle $textRect -fontSize 24
    
    # Add description
    $descRect = New-Object System.Drawing.Rectangle(0, $rect.Height * 0.55, $rect.Width, $rect.Height * 0.15)
    Add-TextOverlay -graphics $g -text $descriptions[$i] -textColor ([System.Drawing.Color]::FromArgb(200, $whiteColor.R, $whiteColor.G, $whiteColor.B)) -rectangle $descRect -fontSize 14
    
    # Add decorative element
    Add-DecorativeElement -graphics $g -rectangle $textRect -color $goldColor
    
    # Save the image
    $galleryImagePath = "$galleryPath\gallery-placeholder-$($i+1).jpg"
    $galleryImage.Save($galleryImagePath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $g.Dispose()
    $galleryImage.Dispose()
}

Write-Host "All placeholder images have been created successfully!"
Write-Host "Hero image: $heroImagePath"
Write-Host "About image: $aboutImagePath"
Write-Host "Gallery images created in: $galleryPath"

