/**
 * 個人テックブログ 型定義
 *
 * 作成日: 2026-07-14
 * 関連設計: architecture.md
 *
 * 信頼性レベル:
 * - 🔵 青信号: EARS要件定義書・設計文書・ユーザヒアリングを参考にした確実な型定義
 * - 🟡 黄信号: EARS要件定義書・設計文書・ユーザヒアリングから妥当な推測による型定義
 * - 🔴 赤信号: EARS要件定義書・設計文書・ユーザヒアリングにない推測による型定義
 *
 * 注: 完全静的サイトのためAPIリクエスト/レスポンス型・DBエンティティ型は存在しない。
 */

import { z } from 'zod';

// ========================================
// frontmatterスキーマ（Zod）
// ========================================

/**
 * 記事frontmatterのバリデーションスキーマ
 * 🔵 信頼性: REQ-002（title/date必須、description/draft任意）・REQ-104より
 */
export const postFrontmatterSchema = z.object({
  title: z.string().min(1), // 🔵 REQ-002: 必須
  date: z.coerce.date(), // 🔵 REQ-002: 必須（YYYY-MM-DD文字列をDateに変換）
  description: z.string().optional(), // 🔵 REQ-002: 任意
  draft: z.boolean().default(false), // 🔵 REQ-002/102: 任意（既定false）
});

/**
 * 記事frontmatter
 * 🔵 信頼性: postFrontmatterSchemaから導出
 */
export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;

// ========================================
// 記事エンティティ
// ========================================

/**
 * 目次項目（h2/h3から抽出）
 * 🔵 信頼性: REQ-006より
 */
export interface TocItem {
  id: string; // 🔵 rehype-slugが付与する見出しID
  text: string; // 🔵 見出しテキスト
  depth: 2 | 3; // 🔵 REQ-006: h2/h3のみ対象
}

/**
 * 記事一覧・検索結果で使う記事サマリー
 * 🔵 信頼性: REQ-003（一覧にtitle/date/descriptionを表示）より
 */
export interface PostSummary {
  slug: string; // 🔵 REQ-012: フォルダ名から日付プレフィックスを除いた部分
  title: string; // 🔵 REQ-002より
  date: string; // 🔵 表示・ソート用ISO文字列（YYYY-MM-DD） 🟡 文字列表現は妥当な推測
  description?: string; // 🔵 REQ-002より（任意）
  folderName: string; // 🔵 EDGE-104: 同一公開日の第2ソートキー（フォルダ名降順）
}

/**
 * 記事詳細（ビルド時に確定する完全な記事データ）
 * 🔵 信頼性: REQ-004〜006より
 */
export interface Post extends PostSummary {
  html: string; // 🔵 REQ-004: 変換済みHTML（Shikiハイライト・画像解決済み）
  toc: readonly TocItem[]; // 🔵 REQ-006: 見出しなしの場合は空配列（EDGE-103）
}

// ========================================
// 検索（Phase 2）
// ========================================

/**
 * 検索インデックスに登録するドキュメント
 * 🔵 信頼性: REQ-009（タイトル・本文対象）・ヒアリングQ4（MiniSearch）より
 */
export interface SearchDocument {
  id: string; // 🔵 slugを使用
  title: string; // 🔵 REQ-009: 検索対象
  content: string; // 🔵 REQ-009: 検索対象（HTMLタグ除去済みプレーンテキスト） 🟡 前処理は妥当な推測
  description?: string; // 🟡 結果表示用の妥当な推測
  date: string; // 🟡 結果表示用の妥当な推測
}

/**
 * 検索結果
 * 🟡 信頼性: 検索UI要件からの妥当な推測
 */
export interface SearchResult {
  post: PostSummary; // 🟡 結果は一覧と同じカード表示を想定
  score: number; // 🟡 MiniSearchのスコア
}

// ========================================
// テーマ（Phase 2）
// ========================================

/**
 * テーマ種別
 * 🔵 信頼性: REQ-010（ライト/ダーク切替）より
 */
export type Theme = 'light' | 'dark';

/**
 * テーマContextの公開インターフェース
 * 🟡 信頼性: REQ-010/201/202からの妥当な推測
 */
export interface ThemeContextValue {
  theme: Theme; // 🔵 REQ-010より
  toggleTheme: () => void; // 🔵 REQ-010より
}

// ========================================
// サイト設定
// ========================================

/**
 * サイト全体の設定（ハードコード回避のため一元管理）
 * 🟡 信頼性: REQ-405・グローバルルール（ハードコード禁止）からの妥当な推測
 */
export interface SiteConfig {
  title: string; // 🟡 サイト名
  description: string; // 🟡 トップページのメタ説明
  baseUrl: string; // 🔵 REQ-405: '/tech-blog-kkito/'（Vite base）
  siteUrl: string; // 🔵 REQ-007: OGP og:url生成用の絶対URL
}

// ========================================
// 信頼性レベルサマリー
// ========================================
/**
 * - 🔵 青信号: 24件（71%）
 * - 🟡 黄信号: 10件（29%）
 * - 🔴 赤信号: 0件（0%）
 *
 * 品質評価: 高品質
 */
