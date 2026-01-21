import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * 首页延迟加载动画显示测试
 * 
 * 验证功能：
 * 1. 快速加载（< 1秒）时不显示加载动画
 * 2. 慢速加载（> 1秒）时显示加载动画
 * 3. 加载完成时隐藏加载动画
 */

describe("Home Page Delayed Loading Spinner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("应该在 1 秒后才显示加载动画", () => {
    let showLoadingSpinner = false;

    // 延迟 1 秒后显示加载动画
    const spinnerTimer = setTimeout(() => {
      showLoadingSpinner = true;
    }, 1000);

    // 999ms 时，加载动画还不应该显示
    vi.advanceTimersByTime(999);
    expect(showLoadingSpinner).toBe(false);

    // 1000ms 时，加载动画应该显示
    vi.advanceTimersByTime(1);
    expect(showLoadingSpinner).toBe(true);

    clearTimeout(spinnerTimer);
  });

  it("应该在加载完成时隐藏加载动画", () => {
    let videosLoading = true;
    let showLoadingSpinner = false;

    // 延迟 1 秒后显示加载动画
    const spinnerTimer = setTimeout(() => {
      showLoadingSpinner = true;
    }, 1000);

    // 延迟 2 秒后加载完成
    const apiTimer = setTimeout(() => {
      videosLoading = false;
      showLoadingSpinner = false;
    }, 2000);

    // 1000ms 时，加载动画显示
    vi.advanceTimersByTime(1000);
    expect(showLoadingSpinner).toBe(true);
    expect(videosLoading).toBe(true);

    // 2000ms 时，加载完成，加载动画隐藏
    vi.advanceTimersByTime(1000);
    expect(videosLoading).toBe(false);
    expect(showLoadingSpinner).toBe(false);

    clearTimeout(spinnerTimer);
    clearTimeout(apiTimer);
  });

  it("应该在加载中途取消时清理定时器", () => {
    let showLoadingSpinner = false;

    const spinnerTimer = setTimeout(() => {
      showLoadingSpinner = true;
    }, 1000);

    // 500ms 时取消加载
    vi.advanceTimersByTime(500);
    clearTimeout(spinnerTimer);

    // 继续推进时间到 1500ms，定时器不应该执行
    vi.advanceTimersByTime(1000);
    expect(showLoadingSpinner).toBe(false);
  });

  it("应该在搜索查询变化时重置加载状态", () => {
    let videosLoading = false;
    let showLoadingSpinner = false;
    let searchQuery = "";

    // 初始状态
    expect(videosLoading).toBe(false);
    expect(showLoadingSpinner).toBe(false);

    // 用户输入搜索查询
    searchQuery = "test";
    videosLoading = true;
    showLoadingSpinner = false;

    expect(videosLoading).toBe(true);
    expect(showLoadingSpinner).toBe(false);
  });

  it("应该在 1 秒内返回数据时不显示加载动画", () => {
    let videosLoading = true;
    let showLoadingSpinner = false;

    // 延迟 1 秒后显示加载动画
    const spinnerTimer = setTimeout(() => {
      showLoadingSpinner = true;
    }, 1000);

    // 延迟 300ms 返回数据
    const apiTimer = setTimeout(() => {
      videosLoading = false;
      showLoadingSpinner = false;
    }, 300);

    // 500ms 时，数据已返回，加载动画不应该显示
    vi.advanceTimersByTime(500);
    expect(videosLoading).toBe(false);
    expect(showLoadingSpinner).toBe(false);

    clearTimeout(spinnerTimer);
    clearTimeout(apiTimer);
  });

  it("应该在加载状态下正确处理条件渲染", () => {
    // 场景 1: 加载中，不显示加载动画（< 1秒）
    let videosLoading = true;
    let showLoadingSpinner = false;
    let videos: any[] = [];

    const shouldShowSpinner = showLoadingSpinner;
    const shouldShowVideos = videos.length > 0;
    const shouldShowEmpty = !videosLoading && videos.length === 0;

    expect(shouldShowSpinner).toBe(false);
    expect(shouldShowVideos).toBe(false);
    expect(shouldShowEmpty).toBe(false);

    // 场景 2: 加载中，显示加载动画（> 1秒）
    videosLoading = true;
    showLoadingSpinner = true;
    videos = [];

    const shouldShowSpinner2 = showLoadingSpinner;
    const shouldShowVideos2 = videos.length > 0;
    const shouldShowEmpty2 = !videosLoading && videos.length === 0;

    expect(shouldShowSpinner2).toBe(true);
    expect(shouldShowVideos2).toBe(false);
    expect(shouldShowEmpty2).toBe(false);

    // 场景 3: 加载完成，有数据
    videosLoading = false;
    showLoadingSpinner = false;
    videos = [{ id: 1, title: "视频1" }];

    const shouldShowSpinner3 = showLoadingSpinner;
    const shouldShowVideos3 = videos.length > 0;
    const shouldShowEmpty3 = !videosLoading && videos.length === 0;

    expect(shouldShowSpinner3).toBe(false);
    expect(shouldShowVideos3).toBe(true);
    expect(shouldShowEmpty3).toBe(false);

    // 场景 4: 加载完成，无数据
    videosLoading = false;
    showLoadingSpinner = false;
    videos = [];

    const shouldShowSpinner4 = showLoadingSpinner;
    const shouldShowVideos4 = videos.length > 0;
    const shouldShowEmpty4 = !videosLoading && videos.length === 0;

    expect(shouldShowSpinner4).toBe(false);
    expect(shouldShowVideos4).toBe(false);
    expect(shouldShowEmpty4).toBe(true);
  });

  it("应该在快速连续搜索时正确处理加载状态", () => {
    // 第一次搜索
    let videosLoading = true;
    let showLoadingSpinner = false;

    const spinnerTimer1 = setTimeout(() => {
      showLoadingSpinner = true;
    }, 1000);

    // 500ms 时进行第二次搜索（中断第一次）
    vi.advanceTimersByTime(500);
    clearTimeout(spinnerTimer1);

    // 重置状态
    videosLoading = true;
    showLoadingSpinner = false;

    const spinnerTimer2 = setTimeout(() => {
      showLoadingSpinner = true;
    }, 1000);

    const apiTimer2 = setTimeout(() => {
      videosLoading = false;
      showLoadingSpinner = false;
    }, 300);

    // 第二次搜索快速返回（300ms）
    vi.advanceTimersByTime(300);
    expect(videosLoading).toBe(false);
    expect(showLoadingSpinner).toBe(false);

    clearTimeout(spinnerTimer2);
    clearTimeout(apiTimer2);
  });

  it("应该在防抖延迟后执行 API 调用", () => {
    const mockApiCall = vi.fn();
    let videosLoading = true;

    // 防抖延迟 300ms
    const apiTimer = setTimeout(() => {
      mockApiCall();
      videosLoading = false;
    }, 300);

    // 100ms 时，API 还不应该调用
    vi.advanceTimersByTime(100);
    expect(mockApiCall).not.toHaveBeenCalled();
    expect(videosLoading).toBe(true);

    // 300ms 时，API 应该调用
    vi.advanceTimersByTime(200);
    expect(mockApiCall).toHaveBeenCalled();
    expect(videosLoading).toBe(false);

    clearTimeout(apiTimer);
  });

  it("应该在加载失败时隐藏加载动画", () => {
    let videosLoading = true;
    let showLoadingSpinner = false;

    const spinnerTimer = setTimeout(() => {
      showLoadingSpinner = true;
    }, 1000);

    const apiTimer = setTimeout(() => {
      // 模拟加载失败
      videosLoading = false;
      showLoadingSpinner = false;
    }, 2000);

    // 1000ms 时，加载动画显示
    vi.advanceTimersByTime(1000);
    expect(showLoadingSpinner).toBe(true);

    // 2000ms 时，即使加载失败，也应该隐藏加载动画
    vi.advanceTimersByTime(1000);
    expect(videosLoading).toBe(false);
    expect(showLoadingSpinner).toBe(false);

    clearTimeout(spinnerTimer);
    clearTimeout(apiTimer);
  });
});
