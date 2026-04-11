# _plugins/add_collection_tags.rb
Jekyll::Hooks.register :site, :post_read do |site|
  # newsコレクションのタグを無理やり全体タグに追加する魔法！
  if site.collections['news']
    site.collections['news'].docs.each do |doc|
      if doc.data['tags']
        doc.data['tags'].each do |tag|
          site.tags[tag] ||= []
          site.tags[tag] << doc unless site.tags[tag].include?(doc)
        end
      end
    end
  end
end