import { useEffect, useRef, useState } from 'react';

interface EmailBodyRendererProps {
  body: string;
  className?: string;
}

/**
 * Safely renders HTML email content in an isolated iframe
 */
export const EmailBodyRenderer = ({ body, className }: EmailBodyRendererProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState<number>(500);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Write the HTML content to the iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // Check if body contains full HTML document or just HTML fragment
    const isFullDocument = body.trim().toLowerCase().startsWith('<!doctype') ||
                          body.trim().toLowerCase().startsWith('<html');

    let htmlContent: string;

    if (isFullDocument) {
      // Use the full HTML document as-is
      htmlContent = body;
    } else {
      // Wrap HTML fragment in a proper document structure
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                font-size: 14px;
                line-height: 1.6;
                color: #1a1a1a;
                margin: 0;
                padding: 16px;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              img {
                max-width: 100%;
                height: auto;
              }
              a {
                color: #0066cc;
                text-decoration: underline;
              }
              pre {
                white-space: pre-wrap;
                word-wrap: break-word;
                background-color: #f5f5f5;
                padding: 12px;
                border-radius: 4px;
                overflow-x: auto;
              }
              blockquote {
                border-left: 3px solid #ccc;
                margin-left: 0;
                padding-left: 16px;
                color: #666;
              }
              table {
                border-collapse: collapse;
                max-width: 100%;
              }
              table td, table th {
                border: 1px solid #ddd;
                padding: 8px;
              }
            </style>
          </head>
          <body>
            ${body}
          </body>
        </html>
      `;
    }

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Resize iframe to fit content
    const resizeIframe = () => {
      try {
        const contentHeight = iframeDoc.body?.scrollHeight || 500;
        setIframeHeight(contentHeight + 20); // Add some padding
      } catch (error) {
        // Cross-origin issues - use default height
        console.error('Error resizing iframe:', error);
      }
    };

    // Resize after content loads
    iframe.onload = resizeIframe;

    // Also resize on window resize
    window.addEventListener('resize', resizeIframe);

    // Initial resize
    setTimeout(resizeIframe, 100);

    return () => {
      window.removeEventListener('resize', resizeIframe);
    };
  }, [body]);

  return (
    <iframe
      ref={iframeRef}
      className={className}
      style={{
        width: '100%',
        height: `${iframeHeight}px`,
        border: 'none',
        display: 'block',
      }}
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      title="Email content"
    />
  );
};
