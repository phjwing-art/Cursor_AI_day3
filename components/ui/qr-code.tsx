'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QrCode, Download, Share } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QRCodeProps {
  url: string
  title?: string
  description?: string
  className?: string
  size?: number
}

export function QRCodeComponent({ 
  url, 
  title = "QR 코드로 접속", 
  description,
  className,
  size = 200
}: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current) return

      try {
        setIsLoading(true)
        setError(null)
        
        await QRCode.toCanvas(canvasRef.current, url, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
      } catch (err) {
        console.error('QR 코드 생성 실패:', err)
        setError('QR 코드 생성에 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    generateQR()
  }, [url, size])

  const handleDownload = () => {
    if (!canvasRef.current) return

    const link = document.createElement('a')
    link.download = 'ai-memo-qr-code.png'
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI 메모장',
          text: 'AI 메모장에 QR 코드로 접속하세요',
          url: url
        })
      } catch (err) {
        console.log('공유 취소됨')
      }
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(url)
      alert('링크가 클립보드에 복사되었습니다!')
    }
  }

  return (
    <Card className={cn('w-full max-w-sm mx-auto', className)}>
      <CardHeader className="text-center pb-3 sm:pb-4 p-4 sm:p-6">
        <div className="flex items-center justify-center mb-2">
          <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2" />
          <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-gray-600">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
        <div className="flex justify-center">
          {isLoading ? (
            <div className="w-40 h-40 sm:w-48 sm:h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="w-40 h-40 sm:w-48 sm:h-48 bg-red-50 rounded-lg flex items-center justify-center">
              <p className="text-red-600 text-xs sm:text-sm text-center px-2">{error}</p>
            </div>
          ) : (
            <canvas 
              ref={canvasRef}
              className="rounded-lg border border-gray-200 max-w-full h-auto"
            />
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload}
            className="flex-1 min-h-[44px]"
            disabled={isLoading || !!error}
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="text-sm">다운로드</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleShare}
            className="flex-1 min-h-[44px]"
            disabled={isLoading || !!error}
          >
            <Share className="h-4 w-4 mr-2" />
            <span className="text-sm">공유</span>
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            QR 코드를 스캔하여 모바일에서 접속하세요
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
