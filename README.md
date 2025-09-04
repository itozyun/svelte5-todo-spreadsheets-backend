# Svelte 5 TODO アプリケーション - Runesシステム学習用

Svelte 5のRunesシステムとTypeScriptを使用した、フル機能のTODOアプリケーションです。

このプロジェクトは、[TypeScriptで学ぶ Svelte 5/SvelteKit 学習ガイド](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript)の実装例として作成されました。**あえてSvelteKitを使用せず**、純粋なSvelte 5アプリケーションとして構築することで、**Runesシステムの理解に集中**できるよう設計しています。

## 🚀 特徴

- **Svelte 5 Runes**: `$state`, `$derived`, `$effect`を活用した最新のリアクティビティシステム
- **TypeScript**: 完全な型定義による型安全な開発
- **LocalStorage連携**: ブラウザリロード後もデータを保持
- **フル機能TODO**: 追加、編集、削除、フィルタリング、一括操作
- **レスポンシブデザイン**: TodoMVC仕様準拠のUI

## 📋 実装されている機能

### 基本機能
- ✅ TODOの追加
- ✅ TODOの完了/未完了の切り替え
- ✅ TODOの削除
- ✅ TODOの編集（ダブルクリックで編集モード）
- ✅ TODOの一括完了/解除

### フィルタリング
- ✅ すべて表示（All）
- ✅ アクティブなTODOのみ表示（Active）
- ✅ 完了済みTODOのみ表示（Completed）

### データ永続化
- ✅ LocalStorageへの自動保存
- ✅ ページリロード時の自動復元

### UI/UX
- ✅ アクティブなTODOのカウント表示
- ✅ 完了済みTODOの一括削除
- ✅ エスケープキーで編集キャンセル
- ✅ エンターキーで編集確定
- ✅ 編集時のフォーカス管理

## 🛠 技術スタック

- **Svelte 5.38+** - 最新のRunesシステム対応
- **TypeScript 5.8+** - 厳密な型チェック
- **Vite 7.1+** - 高速な開発環境とビルド

## 📁 プロジェクト構造

```
svelte5-todo-example/
├── src/
│   ├── types/
│   │   └── todo.ts              # TypeScript型定義
│   ├── stores/
│   │   └── todo.svelte.ts       # Svelte 5 Runesストア
│   ├── components/
│   │   ├── TodoHeader.svelte    # ヘッダーと入力フィールド
│   │   ├── TodoItem.svelte      # 個別のTODOアイテム
│   │   └── TodoFooter.svelte    # フッターとフィルター
│   ├── App.svelte               # メインアプリケーション
│   └── main.ts                  # エントリーポイント
├── package.json
├── tsconfig.json                # TypeScript設定
├── vite.config.ts               # Vite設定
└── README.md                    # このファイル
```

## 🚀 セットアップと起動

### 前提条件
- Node.js 20.x LTS以上（推奨）または 18.13以上（最小要件）
- npm 10.x以上

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/shuji-bonji/svelte5-todo-example.git
cd svelte5-todo-example

# 依存関係のインストール
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開いてアプリケーションを確認できます。

### ビルド

```bash
npm run build
```

ビルド成果物は `dist/` ディレクトリに生成されます。

### プレビュー

```bash
npm run preview
```

ビルドされたアプリケーションをローカルでプレビューできます。

## 💻 主要なコード例

### Svelte 5 Runesを使用した状態管理

```typescript
// stores/todo.svelte.ts
export function createTodoStore() {
  // リアクティブな状態
  let todos = $state<Todo[]>([]);
  let filter = $state<FilterType>('all');

  // 派生値
  let filteredTodos = $derived.by(() => {
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  });

  // 副作用（LocalStorage同期）
  $effect(() => {
    if (todos.length >= 0) {
      localStorage.setItem('svelte5-todos', JSON.stringify(todos));
    }
  });

  // メソッドと公開API
  return {
    get todos() { return todos; },
    get filteredTodos() { return filteredTodos; },
    addTodo,
    toggleTodo,
    // ...
  };
}
```

### TypeScriptによる型定義

```typescript
// types/todo.ts
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export type FilterType = 'all' | 'active' | 'completed';
```

### コンポーネントのProps定義

```typescript
// components/TodoItem.svelte
interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

let { todo, onToggle, onDelete, onEdit }: Props = $props();
```

## 📚 学習ポイント

このプロジェクトから学べる主な内容：

1. **Svelte 5 Runes**
   - `$state`による状態管理
   - `$derived`と`$derived.by()`による計算値
   - `$effect`による副作用処理
   - `$props()`によるコンポーネントプロパティ

2. **TypeScript統合**
   - 厳密な型定義
   - インターフェースと型エイリアス
   - ジェネリック型の活用

3. **コンポーネント設計**
   - 単一責任の原則
   - プロパティによるデータフロー
   - イベントハンドリング

4. **状態管理パターン**
   - グローバルストアの実装
   - リアクティブな派生値
   - LocalStorageとの同期

## 🔗 関連リンク

- [Svelte 5公式ドキュメント](https://svelte.dev/docs)
- [TypeScriptで学ぶ Svelte 5/SvelteKit](https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript/)
- [Svelte 5 Runesシステム解説](https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript/svelte/runes/)

## 📝 ライセンス

MIT

## 🤝 コントリビューション

イシューやプルリクエストは歓迎です。大きな変更を行う場合は、まずイシューを開いて変更内容について議論してください。

## 🚀 次のステップ：応用編

このベースとなるTODOアプリを発展させる方向性：

### 1. PWA化
- Service Workerによるオフライン対応
- manifest.jsonでアプリ化
- プッシュ通知の実装
- ホーム画面への追加

### 2. SvelteKit版への移行
- サーバーサイド処理の追加
- データベース連携（Prisma/Drizzle）
- 認証機能の実装
- マルチユーザー対応
- リアルタイム同期（WebSocket）

詳細な応用編については、[メインガイドの実装例ページ](https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript/examples/todo-app/)をご覧ください。

## 👨‍💻 作者

[@shuji-bonji](https://github.com/shuji-bonji)

---

このプロジェクトはSvelte 5のRunesシステム学習を目的として作成されています。シンプルな実装でRunesの基本を理解した後、PWA化やSvelteKit版への拡張を通じて、段階的に学習を深めることができます。