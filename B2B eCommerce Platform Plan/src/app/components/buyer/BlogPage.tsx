// ============================================================
// BlogPage — Blog công nghệ
// ============================================================
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import {
  Clock, Eye, Tag, ChevronRight, Search, ArrowLeft, Share2,
  Newspaper, TrendingUp, BookOpen, Lightbulb, Filter,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { blogApi } from '../../services/api';
import type { BlogPost, BlogCategory } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Review: Newspaper,
  'So sánh': TrendingUp,
  'Tin tức': BookOpen,
  'Mẹo sử dụng': Lightbulb,
};

const CATEGORY_COLORS: Record<string, string> = {
  Review: 'bg-purple-100 text-purple-700',
  'So sánh': 'bg-blue-100 text-blue-700',
  'Tin tức': 'bg-green-100 text-green-700',
  'Mẹo sử dụng': 'bg-amber-100 text-amber-700',
};

const CATEGORIES: BlogCategory[] = ['Review', 'So sánh', 'Tin tức', 'Mẹo sử dụng'];

// ---- Blog List ----
export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | ''>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    blogApi.getPaginated(
      { page, pageSize: 9 },
      {
        ...(search && { search }),
        ...(selectedCategory && { category: selectedCategory }),
        isPublished: true,
      }
    ).then(res => {
      setPosts(res.data);
      setTotal(res.total);
    }).finally(() => setLoading(false));
  }, [search, selectedCategory, page]);

  const [featured, ...rest] = posts;

  return (
    <div>
      <div className="container mx-auto px-4 py-6">
        <AppBreadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Blog công nghệ' }]} />
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-700 py-12">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Blog Công nghệ</h1>
          <p className="text-gray-300 max-w-xl mx-auto mb-8">
            Tin tức, đánh giá, so sánh và mẹo sử dụng smartphone mới nhất từ đội ngũ chuyên gia CELLPHONES.
          </p>
          <div className="max-w-lg mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10 bg-white"
                placeholder="Tìm bài viết..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <Button className="bg-[#e31837] hover:bg-[#c91432]">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Category filter */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <button
            onClick={() => { setSelectedCategory(''); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${!selectedCategory ? 'bg-gray-900 text-white' : 'border border-gray-200 hover:border-gray-400'}`}
          >
            Tất cả ({total})
          </button>
          {CATEGORIES.map(cat => {
            const Icon = CATEGORY_ICONS[cat];
            return (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setPage(1); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-gray-900 text-white' : 'border border-gray-200 hover:border-gray-400'}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-0 shadow animate-pulse">
                <div className="aspect-[16/9] bg-gray-200 rounded-t-xl" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="font-semibold mb-2">Không có bài viết nào</h3>
            <p className="text-muted-foreground">Thử tìm kiếm khác hoặc xem tất cả danh mục</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured && !search && !selectedCategory && page === 1 && (
              <Link to={`/blog/${featured.slug}`} className="block mb-8">
                <Card className="overflow-hidden border-0 shadow-xl group">
                  <div className="grid md:grid-cols-2">
                    <div className="aspect-video md:aspect-auto overflow-hidden">
                      <ImageWithFallback
                        src={featured.coverImage}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      <Badge className={`mb-3 self-start ${CATEGORY_COLORS[featured.category] || 'bg-gray-100'} border-0`}>
                        {featured.category}
                      </Badge>
                      <h2 className="text-2xl font-bold mb-3 group-hover:text-[#e31837] transition-colors line-clamp-3">
                        {featured.title}
                      </h2>
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-4">{featured.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(featured.publishedAt).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {featured.viewCount.toLocaleString('vi-VN')} lượt xem
                        </span>
                      </div>
                      <Button className="mt-5 self-start bg-[#e31837] hover:bg-[#c91432]">
                        Đọc bài viết <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            )}

            {/* Grid */}
            <div className="grid md:grid-cols-3 gap-5">
              {(featured && !search && !selectedCategory && page === 1 ? rest : posts).map(post => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all border-0 shadow-sm bg-white h-full">
                    <div className="aspect-[16/9] overflow-hidden relative">
                      <ImageWithFallback src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <Badge className={`absolute top-2 left-2 border-0 text-[10px] ${CATEGORY_COLORS[post.category] || 'bg-gray-100'}`}>
                        {post.category}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <p className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-[#e31837] transition-colors">
                        {post.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.viewCount.toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {total > 9 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  Trang trước
                </Button>
                <span className="px-4 py-2 text-sm text-muted-foreground">
                  Trang {page} / {Math.ceil(total / 9)}
                </span>
                <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 9)} onClick={() => setPage(p => p + 1)}>
                  Trang sau
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ---- Blog Detail ----
export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    blogApi.getBySlug(slug).then(p => {
      setPost(p);
      if (p) {
        blogApi.getPaginated({ page: 1, pageSize: 3 }, { category: p.category, isPublished: true })
          .then(res => setRelated(res.data.filter(r => r.id !== p.id).slice(0, 3)));
      }
    }).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-1/3" />
        <div className="aspect-video bg-gray-200 rounded-xl" />
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded" />)}
      </div>
    </div>
  );

  if (!post) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-xl font-bold mb-2">Không tìm thấy bài viết</h2>
      <Link to="/blog"><Button variant="outline" className="mt-4"><ArrowLeft className="h-4 w-4 mr-1" /> Về blog</Button></Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <AppBreadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Blog', href: '/blog' }, { label: post.title }]} />

      <div className="grid lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2">
          <article>
            <Badge className={`mb-4 border-0 ${CATEGORY_COLORS[post.category] || 'bg-gray-100'}`}>
              {post.category}
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">{post.title}</h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1.5">
                <img src={post.authorAvatar} alt={post.author} className="h-6 w-6 rounded-full" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                {post.author}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {new Date(post.publishedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {post.viewCount.toLocaleString('vi-VN')} lượt xem
              </span>
              <button className="flex items-center gap-1 hover:text-[#e31837] transition-colors ml-auto" onClick={() => navigator.clipboard.writeText(window.location.href).then(() => {})}>
                <Share2 className="h-3.5 w-3.5" /> Chia sẻ
              </button>
            </div>

            <div className="aspect-video overflow-hidden rounded-xl mb-8">
              <ImageWithFallback src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            </div>

            <div
              className="prose prose-sm max-w-none text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
            />

            {post.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-8 pt-6 border-t">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}
          </article>

          <div className="mt-6">
            <Link to="/blog">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-1" /> Về danh sách bài viết
              </Button>
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {related.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-5">
                <h3 className="font-bold mb-4">Bài viết liên quan</h3>
                <div className="space-y-4">
                  {related.map(r => (
                    <Link key={r.id} to={`/blog/${r.slug}`} className="flex gap-3 group">
                      <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0">
                        <ImageWithFallback src={r.coverImage} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div>
                        <p className="text-sm font-medium line-clamp-2 group-hover:text-[#e31837] transition-colors">{r.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(r.publishedAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-0 shadow-lg">
            <CardContent className="p-5">
              <h3 className="font-bold mb-4">Danh mục</h3>
              <div className="space-y-2">
                {CATEGORIES.map(cat => {
                  const Icon = CATEGORY_ICONS[cat];
                  return (
                    <Link key={cat} to={`/blog?category=${cat}`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                      <span className="flex items-center gap-2 text-sm">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {cat}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#e31837] transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
