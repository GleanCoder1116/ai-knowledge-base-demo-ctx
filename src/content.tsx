import cssText from "data-text:~style.css"
import { Readability } from "@mozilla/readability"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
// import { CountButton } from "~features/count-button"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const PlasmoOverlay = () => {
  const [show, setShow] = useState(false)
  const [documentInfo, setDocumentInfo] = useState({
    title: "",
    url: "",
    content: "",
    excerpt: ""
  });
  const getContent = () => { 
    setShow(true)
    const documentClone = document.cloneNode(true)
    const reader = new Readability(documentClone as Document)
    const article = reader.parse()
    console.log(article)
    setDocumentInfo({
      title: article.title,
      url: window.location.href,
      content: article.content,
      excerpt: article.excerpt
    })
    // 通知 background.ts
    chrome.runtime.sendMessage({
      type: "get-content",
      data: {
        title: article.title,
        url: window.location.href,
        content: article.content,
        excerpt: article.excerpt
      }
    })
  }
  useEffect(() => { 
    // 添加快捷键 command + shift + e, 需要兼容 mac 和 windows
    const keydownHandler = (e: KeyboardEvent) => { 
      if (e.key === "e" && e.shiftKey && e.metaKey) { 
        getContent()
      }
    }
    document.addEventListener("keydown", keydownHandler)
    // 监听 background.ts 发送的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === "get-content") { 
        setDocumentInfo({
          ...documentInfo,
          title: '嵌入成功'
        })
        setTimeout(() => {
          setShow(false)
        }, 2000)
      }
    })
    return () => {
      document.removeEventListener("keydown", keydownHandler)
    }
  }, [])
  return (
    <div className={show ? 'root-show ai-knowledge-root ' : 'root-hide ai-knowledge-root'}>
      <div className="plasmo-z-50 plasmo-flex plasmo-fixed plasmo-top-32 plasmo-right-8">
        <div className="bg-gray-900 p-6 rounded-lg shadow-xl text-white w-full max-w-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{documentInfo.title}</h2>
            <img src="https://placehold.co/50x50" alt="Placeholder" className="rounded-full" />
          </div>
          <p className="text-sm mb-6">{documentInfo.excerpt}</p>
          <div className="flex items-center justify-center">
            <div className="animate-pulse flex items-center">
              <div className="h-2.5 bg-blue-400 w-8 rounded-full mr-1"></div>
              <div className="h-2.5 bg-blue-400 w-8 rounded-full mr-1"></div>
              <div className="h-2.5 bg-blue-400 w-8 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlasmoOverlay
