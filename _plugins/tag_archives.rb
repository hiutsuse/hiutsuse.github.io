module Site
  class TagPageGenerator < Jekyll::Generator
    def generate(site)
      generate_for_collection(site, site.posts.docs, "articles")
      generate_for_collection(site, site.collections["news"].docs, "news")
    end

    def generate_for_collection(site, docs, base_path)
      tags = docs.flat_map { |doc| doc.data["tags"] || [] }.uniq
      tags.each do |tag|
        site.pages << TagPage.new(site, base_path, tag, docs)
      end
    end
  end

  class TagPage < Jekyll::Page
    def initialize(site, base_path, tag, docs)
      @site = site
      @base = site.source
      @dir  = File.join(base_path, "tags", tag)
      @name = "index.html"
      process(@name)
      read_yaml(File.join(base_path, "_layouts"), "tag_page.html") rescue nil
      self.data["layout"] = "tag_page"
      self.data["tag"] = tag
      self.data["posts"] = docs.select { |d| (d.data["tags"] || []).include?(tag) }
    end
  end
end