/**
 * Strips HTML tags from a string and converts it to plain text
 */
export function stripHtmlTags(html: string): string {
  // Create a temporary DOM element to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Extract text content
  let text = temp.textContent || temp.innerText || '';

  // Clean up extra whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Converts HTML to plain text with better formatting
 * Preserves line breaks and basic structure
 */
export function htmlToPlainText(html: string): string {
  // Create a temporary DOM element
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Replace block-level elements with line breaks
  const blockElements = temp.querySelectorAll(
    'p, div, br, h1, h2, h3, h4, h5, h6, li, blockquote, pre'
  );
  blockElements.forEach((el) => {
    if (el.tagName === 'BR') {
      el.replaceWith('\n');
    } else {
      const text = el.textContent || '';
      el.replaceWith(text + '\n');
    }
  });

  // Get text content
  let text = temp.textContent || temp.innerText || '';

  // Clean up excessive line breaks
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  return text;
}

/**
 * Checks if a string contains HTML tags
 */
export function isHtmlContent(content: string): boolean {
  // Check for common HTML patterns
  const htmlPattern = /<\/?[a-z][\s\S]*>/i;
  return htmlPattern.test(content);
}
