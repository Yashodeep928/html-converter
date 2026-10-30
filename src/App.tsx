
import { useState } from "react";
import "./App.css";

type ArticleBlock =
  | { type: "heading"; text: string; level: number }
  | { type: "paragraph"; content: string[] }
  | { type: "list"; items: string[] }
  | { type: "button"; text: string }
  | { type: "link"; text: string; url: string }
  | { type: "image"; src: string; alt: string }
  | { type: "title"; text: string };

type BlockType = ArticleBlock["type"];

const elementOptions: {
  type: BlockType;
  icon: string;
  label: string;
}[] = [
  { type: "heading", icon: "H", label: "Heading" },
  { type: "paragraph", icon: "¶", label: "Paragraph" },
  { type: "list", icon: "☷", label: "List" },
  { type: "button", icon: "▢", label: "Button" },
  { type: "link", icon: "↗", label: "Link" },
  { type: "image", icon: "▧", label: "Image" },
  { type: "title", icon: "T", label: "Page Title" }
];

const escapeHtml = (text: string) => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const safeUrl = (url: string) => {
  const value = url.trim();

  if (!value) return "";

  if (
    /^https?:\/\/[^/\s?#]+/i.test(value) ||
    (value.startsWith("/") && !value.startsWith("//") &&
      !value.startsWith("/\\"))
  ) {
    return escapeHtml(value);
  }

  return "";
};

const blockToHtml = (content: ArticleBlock[]) => {
  return content
    .map(block => {
      switch (block.type) {
        case "heading":
          return `<h${block.level}>${escapeHtml(block.text)}</h${block.level}>`;

        case "paragraph":
          return `<p>${block.content.map(escapeHtml).join("")}</p>`;

        case "list":
          return `<ul>\n${block.items
            .map(item => `  <li>${escapeHtml(item)}</li>`)
            .join("\n")}\n</ul>`;

        case "button":
          return `<button type="button">${escapeHtml(block.text)}</button>`;

        case "link":
          return `<a href="${safeUrl(block.url)}">${escapeHtml(block.text)}</a>`;

        case "image": {
          const src = safeUrl(block.src);
          return src
            ? `<img src="${src}" alt="${escapeHtml(block.alt)}" />`
            : "";
        }

        case "title":
          return `<title>${escapeHtml(block.text)}</title>`;
      }
    })
    .join("\n");
};

function App() {
  const [blocks, setBlocks] = useState<ArticleBlock[]>([]);
  const [html, setHtml] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  // Create objects
  const addBlock = (type: BlockType) => {
    const newBlock: ArticleBlock =
      type === "heading"
        ? { type, text: "", level: 2 }
        : type === "paragraph"
        ? { type, content: [""] }
        : type === "list"
        ? { type, items: [""] }
        : type === "link"
        ? { type, text: "", url: "" }
        : type === "image"
        ? { type, src: "", alt: "" }
        : { type, text: "" };

    setBlocks(current => [...current, newBlock]);
  };

  // Update an object
  const replace = (index: number, newBlock: ArticleBlock) => {
    setBlocks(current =>
      current.map((block, i) =>
        i === index ? newBlock : block
      )
    );
  };

  // Remove an object
  const removeBlock = (index: number) => {
    setBlocks(current =>
      current.filter((_, i) => i !== index)
    );
  };

  // Convert objects to HTML
  const generateHtml = () => {
    setHtml(blockToHtml(blocks));
    setHasGenerated(true);
    setCopied(false);
  };

  // Copy generated code
  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
    } catch {
      alert("Could not copy the HTML.");
    }
  };

  const isOutdated =
    hasGenerated && html !== blockToHtml(blocks);

  // Render the generated HTML inside an isolated document
  const previewDocument = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  body {
    font-family: Arial, sans-serif;
    color: #172b4d;
    padding: 16px;
    line-height: 1.7;
    overflow-wrap: anywhere;
  }
  img { max-width: 100%; height: auto; }
  button { padding: 10px 18px; cursor: pointer; }
  a { color: #1378c8; }
</style>
</head>
<body>
${html}
</body>
</html>`;

  return (
    <main className="app">
      {/* HEADER */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-logo">{"</>"}</div>

          <div>
            <h1>HTML Builder</h1>
            <p>Visual HTML code generator</p>
          </div>
        </div>

        <span className="header-badge">
          React + TypeScript
        </span>
      </header>

      <div className="workspace">
        {/* LEFT PANEL */}
        <section className="panel editor-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">WORKSPACE</span>
              <h2>Element Editor</h2>
              <p>Choose elements and customize their content.</p>
            </div>

            <span className="block-count">
              {blocks.length} blocks
            </span>
          </div>

          <div className="editor-content">
            <div className="section-heading">
              <h3>Add an element</h3>
            </div>

            <div className="element-grid">
              {elementOptions.map(option => (
                <button
                  key={option.type}
                  className="element-button"
                  onClick={() => addBlock(option.type)}
                >
                  <span className="element-icon">
                    {option.icon}
                  </span>

                  <span>{option.label}</span>

                  <span className="element-plus">+</span>
                </button>
              ))}
            </div>

            <div className="section-heading blocks-heading">
              <h3>Your elements</h3>
              <span>{blocks.length} added</span>
            </div>

            {blocks.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">+</div>

                <h3>Start building your HTML</h3>

                <p>
                  Select an element above to add it
                  to your workspace.
                </p>
              </div>
            )}

            <div className="blocks-list">
              {blocks.map((block, index) => (
                <article className="block-card" key={index}>
                  <div className="block-header">
                    <div className="block-identity">
                      <span className="block-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <h3>
                        {block.type === "title"
                          ? "Page Title"
                          : block.type}
                      </h3>
                    </div>

                    <button
                      className="remove-button"
                      onClick={() => removeBlock(index)}
                      aria-label={`Remove ${block.type} block`}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="block-body">
                    {block.type === "heading" && (
                      <>
                        <label className="field">
                          <span>Heading level</span>

                          <select
                            value={block.level}
                            onChange={event =>
                              replace(index, {
                                ...block,
                                level: Number(event.target.value)
                              })
                            }
                          >
                            {[1, 2, 3, 4, 5, 6].map(level => (
                              <option key={level} value={level}>
                                H{level}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="field">
                          <span>Heading text</span>

                          <input
                            placeholder="Enter your heading..."
                            value={block.text}
                            onChange={event =>
                              replace(index, {
                                ...block,
                                text: event.target.value
                              })
                            }
                          />
                        </label>
                      </>
                    )}

                    {block.type === "paragraph" && (
                      <label className="field">
                        <span>Paragraph content</span>

                        <textarea
                          rows={4}
                          placeholder="Write your paragraph..."
                          value={block.content[0]}
                          onChange={event =>
                            replace(index, {
                              ...block,
                              content: [event.target.value]
                            })
                          }
                        />
                      </label>
                    )}

                    {block.type === "list" && (
                      <>
                        {block.items.map((item, itemIndex) => (
                          <div className="field" key={itemIndex}>
                            <span>Item {itemIndex + 1}</span>

                            <div className="list-item-row">
                              <input
                                placeholder="Enter list item..."
                                value={item}
                                onChange={event =>
                                  replace(index, {
                                    ...block,
                                    items: block.items.map(
                                      (value, i) =>
                                        i === itemIndex
                                          ? event.target.value
                                          : value
                                    )
                                  })
                                }
                              />

                              <button
                                className="icon-button"
                                aria-label={`Remove list item ${itemIndex + 1}`}
                                onClick={() =>
                                  replace(index, {
                                    ...block,
                                    items: block.items.filter(
                                      (_, i) => i !== itemIndex
                                    )
                                  })
                                }
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          className="add-item-button"
                          onClick={() =>
                            replace(index, {
                              ...block,
                              items: [...block.items, ""]
                            })
                          }
                        >
                          + Add list item
                        </button>
                      </>
                    )}

                    {block.type === "button" && (
                      <label className="field">
                        <span>Button label</span>

                        <input
                          placeholder="e.g. Get Started"
                          value={block.text}
                          onChange={event =>
                            replace(index, {
                              ...block,
                              text: event.target.value
                            })
                          }
                        />
                      </label>
                    )}

                    {block.type === "link" && (
                      <>
                        <label className="field">
                          <span>Link text</span>

                          <input
                            placeholder="e.g. Visit Website"
                            value={block.text}
                            onChange={event =>
                              replace(index, {
                                ...block,
                                text: event.target.value
                              })
                            }
                          />
                        </label>

                        <label className="field">
                          <span>Destination URL</span>

                          <input
                            type="url"
                            placeholder="https://example.com"
                            value={block.url}
                            onChange={event =>
                              replace(index, {
                                ...block,
                                url: event.target.value
                              })
                            }
                          />
                        </label>
                      </>
                    )}

                    {block.type === "image" && (
                      <>
                        <label className="field">
                          <span>Image URL</span>

                          <input
                            placeholder="https://example.com/image.jpg"
                            value={block.src}
                            onChange={event =>
                              replace(index, {
                                ...block,
                                src: event.target.value
                              })
                            }
                          />
                        </label>

                        <label className="field">
                          <span>Alternative text</span>

                          <input
                            placeholder="Describe your image"
                            value={block.alt}
                            onChange={event =>
                              replace(index, {
                                ...block,
                                alt: event.target.value
                              })
                            }
                          />
                        </label>
                      </>
                    )}

                    {block.type === "title" && (
                      <>
                        <label className="field">
                          <span>Browser tab title</span>

                          <input
                            placeholder="My Website"
                            value={block.text}
                            onChange={event =>
                              replace(index, {
                                ...block,
                                text: event.target.value
                              })
                            }
                          />
                        </label>

                        <p className="field-help">
                          The title belongs in the HTML head
                          and does not appear on the page.
                        </p>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* CURRENT CONTENT ARRAY - COMMENTED OUT

            <h2>Current Content Array</h2>
            <pre>{JSON.stringify(blocks, null, 2)}</pre>

            */}
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="panel output-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">RESULT</span>
              <h2>HTML Output</h2>
              <p>Generate, preview, and copy your HTML.</p>
            </div>
          </div>

          <div className="output-content">
            <div className="action-bar">
              <button
                className="primary-button"
                onClick={generateHtml}
              >
                Generate HTML
              </button>

              <button
                className="secondary-button"
                onClick={copyHtml}
                disabled={!hasGenerated || !html}
              >
                {copied ? "✓ Copied" : "Copy HTML"}
              </button>
            </div>

            {isOutdated && (
              <p className="outdated-message" role="status">
                Your content has changed. Generate again
                to update the output.
              </p>
            )}

            <div className="output-section">
              <div className="section-heading">
                <h3>Generated Code</h3>
                <span className="code-language">HTML</span>
              </div>

              <div className="code-editor">
                <div className="code-header">
                  <span className="code-dots">
                    <i />
                    <i />
                    <i />
                  </span>

                  <span>index.html</span>
                </div>

                <pre>
                  <code>
                    {hasGenerated
                      ? html || "<!-- No HTML generated -->"
                      : "<!-- Your generated HTML will appear here -->"}
                  </code>
                </pre>
              </div>
            </div>

            <div className="output-section">
              <div className="section-heading">
                <h3>Live Preview</h3>
                <span className="preview-label">
                  Browser view
                </span>
              </div>

              <div className="preview-container">
                <div className="preview-toolbar">
                  <span className="preview-dot" />
                  <span>Preview</span>
                </div>

                {hasGenerated && html ? (
                  <iframe
                    title="Generated HTML Preview"
                    className="preview-frame"
                    sandbox=""
                    srcDoc={previewDocument}
                  />
                ) : (
                  <div className="preview-empty">
                    <div className="preview-empty-icon">
                      ◇
                    </div>

                    <p>Nothing to preview yet</p>

                    <span>
                      Generate HTML to see your result.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="app-footer">
        Built with React + TypeScript · No backend required
      </footer>
    </main>
  );
}

export default App;
