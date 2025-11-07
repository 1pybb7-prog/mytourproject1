"use client";

import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { useBookmarkedTours } from "@/hooks/useBookmarkedTours";
import { removeBookmark } from "@/lib/api/supabase-api";
import TourCard from "@/components/TourCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Checkbox 컴포넌트가 없으므로 간단한 체크박스 구현
import { ArrowUpDown, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TourItem } from "@/lib/types/tour";
import { toast } from "sonner";

/**
 * @file BookmarkList.tsx
 * @description 북마크 목록 컴포넌트
 *
 * 북마크한 관광지 목록을 표시하고 관리하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 북마크한 관광지 목록 표시 (TourCard 재사용)
 * 2. 정렬 옵션 (최신순, 이름순, 지역별)
 * 3. 일괄 삭제 기능
 * 4. Spacing-First 정책 준수
 *
 * @see {@link /docs/prd.md#261-북마크-추가-기능} - PRD 문서의 북마크 섹션
 */

/**
 * 북마크 정렬 옵션 타입
 */
type BookmarkSortOption = "latest" | "name" | "area";

/**
 * 북마크 목록 컴포넌트
 */
export default function BookmarkList() {
  const { userId } = useAuth();
  const supabase = useClerkSupabaseClient();
  const queryClient = useQueryClient();
  const { tours, isLoading, error } = useBookmarkedTours();

  const [sortOption, setSortOption] = useState<BookmarkSortOption>("latest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * 정렬된 관광지 목록
   */
  const sortedTours = useMemo(() => {
    if (!tours || tours.length === 0) {
      return [];
    }

    const sorted = [...tours];

    switch (sortOption) {
      case "latest":
        // 북마크 생성일 기준 내림차순 (modifiedtime 사용)
        return sorted.sort((a, b) => {
          const timeA = a.modifiedtime || "0";
          const timeB = b.modifiedtime || "0";
          if (timeA !== timeB) {
            return timeB.localeCompare(timeA);
          }
          return a.contentid.localeCompare(b.contentid);
        });

      case "name":
        // 이름순 (가나다순)
        return sorted.sort((a, b) => {
          return a.title.localeCompare(b.title, "ko", {
            numeric: true,
            sensitivity: "base",
          });
        });

      case "area":
        // 지역별 (areacode 기준, 주소 첫 글자 기준)
        return sorted.sort((a, b) => {
          const addrA = a.addr1 || "";
          const addrB = b.addr1 || "";
          return addrA.localeCompare(addrB, "ko", {
            numeric: true,
            sensitivity: "base",
          });
        });

      default:
        return sorted;
    }
  }, [tours, sortOption]);

  /**
   * 체크박스 토글 핸들러
   */
  const handleToggleSelect = (contentId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(contentId)) {
        next.delete(contentId);
      } else {
        next.add(contentId);
      }
      return next;
    });
  };

  /**
   * 전체 선택/해제 핸들러
   */
  const handleToggleSelectAll = () => {
    if (selectedIds.size === sortedTours.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedTours.map((tour) => tour.contentid)));
    }
  };

  /**
   * 일괄 삭제 핸들러
   */
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0 || !userId) {
      return;
    }

    const confirmMessage = `선택한 ${selectedIds.size}개의 북마크를 삭제하시겠습니까?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    console.log("[BookmarkList] 일괄 삭제 시작:", selectedIds.size);

    try {
      // 모든 북마크 삭제를 병렬로 실행
      const deletePromises = Array.from(selectedIds).map(async (contentId) => {
        try {
          await removeBookmark(supabase, {
            user_id: userId,
            content_id: contentId,
          });
          console.log(`[BookmarkList] 북마크 삭제 완료: ${contentId}`);
        } catch (error) {
          console.error(`[BookmarkList] 북마크 삭제 실패: ${contentId}`, error);
          throw error;
        }
      });

      await Promise.all(deletePromises);

      // 쿼리 무효화 및 재조회
      queryClient.invalidateQueries({ queryKey: ["bookmarks", userId] });
      queryClient.invalidateQueries({ queryKey: ["bookmarked-tours"] });

      // 선택 초기화
      setSelectedIds(new Set());

      toast.success(`${selectedIds.size}개의 북마크가 삭제되었습니다.`);
      console.log("[BookmarkList] 일괄 삭제 완료");
    } catch (error) {
      console.error("[BookmarkList] 일괄 삭제 실패:", error);
      toast.error("북마크 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">
            북마크 목록을 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-8">
          <div className="text-destructive font-semibold">
            북마크 목록을 불러올 수 없습니다
          </div>
          <div className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "오류가 발생했습니다. 잠시 후 다시 시도해주세요."}
          </div>
        </div>
      </div>
    );
  }

  // 북마크가 없는 경우
  if (sortedTours.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-muted bg-muted/50 p-12">
          <Star className="size-12 text-muted-foreground" />
          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="text-lg font-semibold">
              북마크한 관광지가 없습니다
            </h3>
            <p className="text-sm text-muted-foreground">
              관광지를 북마크하면 여기에 표시됩니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* 컨트롤 영역 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* 정렬 옵션 */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="size-4 text-muted-foreground" />
          <Select
            value={sortOption}
            onValueChange={(value) =>
              setSortOption(value as BookmarkSortOption)
            }
          >
            <SelectTrigger className="w-[140px] sm:w-[160px]">
              <SelectValue placeholder="정렬 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="name">이름순</SelectItem>
              <SelectItem value="area">지역별</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 일괄 삭제 버튼 */}
        {selectedIds.size > 0 && (
          <Button
            variant="destructive"
            size="default"
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="gap-2"
          >
            <Trash2 className="size-4" />
            선택한 {selectedIds.size}개 삭제
          </Button>
        )}
      </div>

      {/* 전체 선택 체크박스 */}
      <div className="flex items-center gap-2 border-b pb-4">
        <input
          type="checkbox"
          id="select-all"
          checked={
            sortedTours.length > 0 && selectedIds.size === sortedTours.length
          }
          onChange={handleToggleSelectAll}
          className="size-4 cursor-pointer rounded border-border"
        />
        <label
          htmlFor="select-all"
          className="text-sm font-medium cursor-pointer"
        >
          전체 선택 ({selectedIds.size}/{sortedTours.length})
        </label>
      </div>

      {/* 북마크 목록 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedTours.map((tour) => (
          <div key={tour.contentid} className="relative">
            {/* 체크박스 */}
            <div className="absolute left-2 top-2 z-10">
              <input
                type="checkbox"
                checked={selectedIds.has(tour.contentid)}
                onChange={() => handleToggleSelect(tour.contentid)}
                onClick={(e) => e.stopPropagation()}
                className="size-4 cursor-pointer rounded border-border bg-background/90 backdrop-blur-sm"
              />
            </div>

            {/* TourCard */}
            <TourCard tour={tour} />
          </div>
        ))}
      </div>
    </div>
  );
}
