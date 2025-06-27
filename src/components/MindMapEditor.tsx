import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Markmap } from "markmap-view";
import { Transformer } from "markmap-lib";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import { toPng, toJpeg } from "html-to-image";
import { saveAs } from "file-saver";

interface Props {
  markdown: string;
  showDownloadBtn?: boolean;
}

const transformer = new Transformer();

const MindMapEditor = forwardRef(({ markdown, showDownloadBtn }: Props, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const markmapInstance = useRef<any>(null);

  // 下载菜单
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  // 导出方法
  const downloadSvg = () => {
    if (svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      saveAs(blob, "mindmap.svg");
    }
  };
  const downloadPng = async () => {
    if (svgRef.current) {
      const dataUrl = await toPng(svgRef.current as unknown as HTMLElement, {
        backgroundColor: '#fff',
      });
      saveAs(dataUrl, "mindmap.png");
    }
  };
  const downloadJpg = async () => {
    if (svgRef.current) {
      const dataUrl = await toJpeg(svgRef.current as unknown as HTMLElement, {
        backgroundColor: '#fff',
      });
      saveAs(dataUrl, "mindmap.jpg");
    }
  };
  const downloadXmind = () => {
    // 导出为XMind支持的Markdown格式
    // 头部加上#mindmap
    const xmindContent = `#mindmap\n${markdown.trim()}`;
    const blob = new Blob([xmindContent], { type: "text/markdown" });
    saveAs(blob, "mindmap.xmind.md");
  };

  useImperativeHandle(ref, () => ({
    downloadSvg,
    downloadPng,
    downloadJpg,
    downloadXmind,
  }));

  useEffect(() => {
    if (svgRef.current) {
      const { root } = transformer.transform(markdown);
      if (!markmapInstance.current) {
        markmapInstance.current = Markmap.create(svgRef.current, undefined, root);
      } else {
        markmapInstance.current.setData(root);
        markmapInstance.current.fit();
      }
    }
  }, [markdown]);

  return (
    <Box>
      <svg ref={svgRef} style={{ width: "100%", height: "600px" }} />
      {showDownloadBtn && (
        <>
          <Button
            variant="outlined"
            onClick={handleMenuClick}
            sx={{ mt: 2 }}
          >
            下载脑图
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
            <MenuItem onClick={() => { downloadSvg(); handleMenuClose(); }}>SVG</MenuItem>
            <MenuItem onClick={() => { downloadPng(); handleMenuClose(); }}>PNG</MenuItem>
            <MenuItem onClick={() => { downloadJpg(); handleMenuClose(); }}>JPG</MenuItem>
            <MenuItem onClick={() => { downloadXmind(); handleMenuClose(); }}>XMind</MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
});

export default MindMapEditor; 