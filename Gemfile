source "https://rubygems.org"

# 最新のRubyでも動くように、Jekyllのバージョンを少し新しく指定するよ
gem "jekyll", "~> 4.3"

# Ruby 3.4/4.0で標準から外れた部品たち
gem "csv"
gem "bigdecimal"
gem "base64"
gem "logger"
gem "webrick"

# GitHub Pages環境に近づけるための設定
# ※github-pages gemを使うと古いJekyllに固定されちゃうことがあるから、
# 自作サイトなら個別にプラグインを入れるのが今のトレンドだよ！
group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-seo-tag"
end