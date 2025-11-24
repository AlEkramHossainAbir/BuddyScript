"use client";

import { useEffect, useRef } from "react";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
}

interface Reaction {
  user: User;
  type: "like" | "love" | "haha" | "wow" | "sad" | "angry";
  _id?: string;
}

interface ReactorsModalProps {
  reactions: Reaction[];
  onClose: () => void;
}

export default function ReactorsModal({ reactions, onClose }: ReactorsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const getReactionEmoji = (type: string) => {
    switch (type) {
      case "like":
        return "👍";
      case "love":
        return "❤️";
      case "haha":
        return "😂";
      case "wow":
        return "😮";
      case "sad":
        return "😢";
      case "angry":
        return "😠";
      default:
        return "👍";
    }
  };

  const getReactionText = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Group reactions by type
  const reactionsByType: { [key: string]: Reaction[] } = {};
  reactions.forEach((reaction) => {
    if (!reactionsByType[reaction.type]) {
      reactionsByType[reaction.type] = [];
    }
    reactionsByType[reaction.type].push(reaction);
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        ref={modalRef}
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "500px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e4e6eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
            Reactions ({reactions.length})
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "24px",
              color: "#65676b",
              padding: "0",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f2f3f5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            ×
          </button>
        </div>

        {/* Reaction Tabs */}
        <div
          style={{
            padding: "12px 20px",
            borderBottom: "1px solid #e4e6eb",
            display: "flex",
            gap: "12px",
            overflowX: "auto",
          }}
        >
          <div
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              backgroundColor: "#e7f3ff",
              color: "#1877f2",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              whiteSpace: "nowrap",
            }}
          >
            All {reactions.length}
          </div>
          {Object.entries(reactionsByType).map(([type, typeReactions]) => (
            <div
              key={type}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                backgroundColor: "#f0f2f5",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: "16px" }}>{getReactionEmoji(type)}</span>
              {typeReactions.length}
            </div>
          ))}
        </div>

        {/* Reactors List */}
        <div
          style={{
            padding: "8px 0",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {reactions.map((reaction, index) => (
            <div
              key={`${reaction.user._id}-${index}`}
              style={{
                padding: "8px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f2f3f5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img
                  src={reaction.user.profilePicture}
                  alt={`${reaction.user.firstName} ${reaction.user.lastName}`}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <div>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#050505",
                    }}
                  >
                    {reaction.user.firstName} {reaction.user.lastName}
                  </h4>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ fontSize: "20px" }}>
                  {getReactionEmoji(reaction.type)}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    color: "#65676b",
                    fontWeight: "500",
                  }}
                >
                  {getReactionText(reaction.type)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
