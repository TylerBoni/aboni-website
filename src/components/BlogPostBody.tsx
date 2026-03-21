import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function BlogPostBody({
  content,
  contentFormat,
}: {
  content: string
  contentFormat: 'markdown' | 'html'
}) {
  if (contentFormat === 'html') {
    return (
      <div
        className="typography"
        // Trusted: authored via your CMS / WP-compatible API only
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return (
    <div className="typography">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
